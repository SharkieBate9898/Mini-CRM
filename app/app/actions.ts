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

export async function addLead(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    source: formData.get("source"),
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
