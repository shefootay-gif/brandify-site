import { z } from "zod";
import { db } from "@/server/db";
import { ctaEvents } from "@/server/db/schema";
import { clientIp, consumeRateLimit } from "@/server/services/rate-limit";

const body = z.object({
  type: z.enum(["whatsapp", "social"]),
  cta: z.string().max(80).default(""),
  page: z.string().max(200).default(""),
  locale: z.enum(["ar", "en"]).optional(),
});

/** First-party, anonymous click counter (sent with navigator.sendBeacon). */
export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(`track:${clientIp(request.headers)}`, 30, 600))) return new Response(null, { status: 204 });
    const data = body.parse(JSON.parse(await request.text()));
    await db.insert(ctaEvents).values({ type: data.type, cta: data.cta, page: data.page, locale: data.locale ?? "" });
  } catch {
    // Tracking must never surface errors to visitors.
  }
  return new Response(null, { status: 204 });
}
