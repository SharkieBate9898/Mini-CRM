"use client";

import { useFormState } from "react-dom";
import { handleAuth } from "@/app/login/actions";
import { useState } from "react";

const initialState: { error?: string } = {};

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [state, formAction] = useFormState(handleAuth, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "login"
            ? "Sign in to manage your leads and follow-ups."
            : "Sign up to start tracking your pipeline."}
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="mode" value={mode} />
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full"
              placeholder="agent@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-2 w-full"
              placeholder="••••••••"
            />
          </div>
          {state?.error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 py-2 text-white"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          {mode === "login" ? "New here?" : "Already have an account?"} {" "}
          <button
            type="button"
            className="font-medium text-slate-900"
            onClick={() =>
              setMode((prev) => (prev === "login" ? "signup" : "login"))
            }
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
