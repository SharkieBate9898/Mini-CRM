"use server";

import { z } from "zod";
import { createLead } from "@/lib/leads";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().optional(),
});

function resolveFormData(
  stateOrFormData: { error?: string; success?: boolean } | FormData,
  maybeFormData?: FormData
) {
  if (stateOrFormData instanceof FormData) {
    return stateOrFormData;
  }
  if (maybeFormData instanceof FormData) {
    return maybeFormData;
  }
  return null;
}

export async function addLead(
  stateOrFormData: { error?: string; success?: boolean } | FormData,
  formData?: FormData
) {
  const data = resolveFormData(stateOrFormData, formData);
  if (!data) {
    return { error: "Unable to read form submission. Please try again." };
  }
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = leadSchema.safeParse({
    name: data.get("name"),
    phone: data.get("phone"),
    email: data.get("email"),
    source: data.get("source"),
  });

  if (!values.success) {
    return { error: "Please enter a name and valid email (if provided)." };
  }

  createLead(user.id, {
    name: values.data.name,
    phone: values.data.phone || undefined,
    email: values.data.email || undefined,
    source: values.data.source || "unknown",
  });

  revalidatePath("/app");
  return { success: true };
}
