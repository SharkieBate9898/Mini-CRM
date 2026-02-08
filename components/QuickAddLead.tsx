"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addLead } from "@/app/app/actions";

const initialState: { error?: string; success?: boolean } = {};

export default function QuickAddLead() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addLead, initialState);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Quick Add Lead
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Lead</h2>
              <button
                type="button"
                className="text-sm text-slate-500"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <form action={formAction} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input name="name" className="mt-2 w-full" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input name="phone" className="mt-2 w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input name="email" type="email" className="mt-2 w-full" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <input
                  name="source"
                  className="mt-2 w-full"
                  placeholder="open house, referral, etc"
                />
              </div>
              {state?.error ? (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state.error}
                </p>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
                >
                  Save Lead
                </button>
              </div>
              {state?.success ? (
                <p className="text-sm text-green-600">
                  Lead created! Refresh to see it.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
