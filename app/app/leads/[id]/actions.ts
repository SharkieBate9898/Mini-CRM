"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { addInteraction, updateLead } from "@/lib/leads";
import { leadStages, interactionTypes } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const stageSchema = z.object({
  leadId: z.string(),
  stage: z.enum(leadStages),
});

const noteSchema = z.object({
  leadId: z.string(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  leadId: z.string(),
  next_action_at: z.string().optional(),
  next_action_text: z.string().optional(),
});

const interactionSchema = z.object({
  leadId: z.string(),
  type: z.enum(interactionTypes),
  content: z.string().min(1),
  occurred_at: z.string().optional(),
});

export async function updateStage(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = stageSchema.parse({
    leadId: formData.get("leadId"),
    stage: formData.get("stage"),
  });

  updateLead(user.id, Number(values.leadId), { stage: values.stage });
  revalidatePath(`/app/leads/${values.leadId}`);
}

export async function saveNotes(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = noteSchema.parse({
    leadId: formData.get("leadId"),
    notes: formData.get("notes")?.toString(),
  });

  updateLead(user.id, Number(values.leadId), { notes: values.notes ?? null });
  revalidatePath(`/app/leads/${values.leadId}`);
}

export async function updateNextAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = contactSchema.parse({
    leadId: formData.get("leadId"),
    next_action_at: formData.get("next_action_at")?.toString(),
    next_action_text: formData.get("next_action_text")?.toString(),
  });

  updateLead(user.id, Number(values.leadId), {
    next_action_at: values.next_action_at ? new Date(values.next_action_at).toISOString() : null,
    next_action_text: values.next_action_text ?? null,
  });
  revalidatePath(`/app/leads/${values.leadId}`);
}

export async function markContacted(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const leadId = Number(formData.get("leadId"));
  updateLead(user.id, leadId, { last_contacted_at: new Date().toISOString() });
  revalidatePath(`/app/leads/${leadId}`);
}

export async function addLeadInteraction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = interactionSchema.parse({
    leadId: formData.get("leadId"),
    type: formData.get("type"),
    content: formData.get("content"),
    occurred_at: formData.get("occurred_at")?.toString(),
  });

  addInteraction(user.id, Number(values.leadId), {
    type: values.type,
    content: values.content,
    occurred_at: values.occurred_at ? new Date(values.occurred_at).toISOString() : undefined,
  });
  revalidatePath(`/app/leads/${values.leadId}`);
}
