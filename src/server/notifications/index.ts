import "server-only";

export type NewLeadPayload = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  sourcePage: string;
};

interface Notifier {
  newLead(lead: NewLeadPayload): Promise<void>;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Email via Resend's HTTP API — enabled only when both env vars are set. */
function resendNotifier(apiKey: string, to: string): Notifier {
  return {
    async newLead(lead) {
      const rows = [
        ["Name", lead.name],
        ["WhatsApp", lead.whatsapp],
        ["Email", lead.email],
        ["Company", lead.company],
        ["Service", lead.service],
        ["Budget", lead.budget],
        ["Page", lead.sourcePage],
        ["Message", lead.message],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#4A5571">${k}</td><td>${escape(v!)}</td></tr>`)
        .join("");
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_NOTIFY_FROM ?? "Brandify Website <onboarding@resend.dev>",
          to: [to],
          subject: `New Lead from Brandify Website — ${lead.name}`,
          html: `<h2 style="color:#021D4E">New lead</h2><table>${rows}</table><p><a href="${site}/admin/leads/${lead.id}">Open in dashboard</a></p>`,
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    },
  };
}

const noopNotifier: Notifier = { async newLead() {} };

function getNotifier(): Notifier {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  return key && to ? resendNotifier(key, to) : noopNotifier;
}

/** Never throws — a failed notification must not lose the lead. */
export async function notifyNewLead(lead: NewLeadPayload) {
  try {
    await getNotifier().newLead(lead);
  } catch (error) {
    console.error("[notify] new lead notification failed", error);
  }
}
