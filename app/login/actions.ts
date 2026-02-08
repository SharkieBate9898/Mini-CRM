"use server";

import { z } from "zod";
import { getDb } from "@/lib/db";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  mode: z.enum(["login", "signup"]),
});

function resolveFormData(
  stateOrFormData: { error?: string } | FormData,
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

export async function handleAuth(
  stateOrFormData: { error?: string } | FormData,
  formData?: FormData
) {
  const data = resolveFormData(stateOrFormData, formData);
  if (!data) {
    return { error: "Unable to read form submission. Please try again." };
  }
  const values = authSchema.safeParse({
    email: data.get("email"),
    password: data.get("password"),
    mode: data.get("mode"),
  });

  if (!values.success) {
    return { error: "Please enter a valid email and password (min 6 chars)." };
  }

  const { email, password, mode } = values.data;
  const db = getDb();

  if (mode === "signup") {
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email) as { id: number } | undefined;
    if (existing) {
      return { error: "Account already exists. Please log in." };
    }

    const hash = await hashPassword(password);
    const result = db
      .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
      .run(email, hash);
    await createSession(Number(result.lastInsertRowid));
    redirect("/app");
  }

  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; password_hash: string } | undefined;

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/app");
}
