"use server";

import { z } from "zod";
import { runAction, NotFoundError } from "@/server/admin/action";
import { addLeadNote, deleteLead, setLeadStatus } from "@/server/services/leads";
import { leadStatuses } from "@/server/db/schema";

export async function setLeadStatusAction(id: string, status: string) {
  return runAction({}, async (user) => {
    const lead = await setLeadStatus(z.uuid().parse(id), z.enum(leadStatuses).parse(status), user.id);
    if (!lead) throw new NotFoundError();
  });
}

export async function addLeadNoteAction(id: string, body: string) {
  return runAction({}, async (user) => {
    const text = z.string().trim().min(1, "required").max(2000).parse(body);
    await addLeadNote(z.uuid().parse(id), text, user.id);
  });
}

export async function deleteLeadAction(id: string) {
  return runAction({ role: "admin" }, async (user) => {
    const lead = await deleteLead(z.uuid().parse(id), user.id);
    if (!lead) throw new NotFoundError();
  });
}
