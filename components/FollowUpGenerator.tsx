"use client";

import { useMemo, useState, useTransition } from "react";
import type { Lead } from "@/lib/leads";
import { getTemplate } from "@/lib/followup";

type Props = {
  leads: Lead[];
};

export default function FollowUpGenerator({ leads }: Props) {
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? 0);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedId),
    [leads, selectedId]
  );

  const handleTemplate = () => {
    if (!selectedLead) return;
    setMessage(getTemplate(selectedLead.stage, selectedLead.name));
  };

  const handleAi = () => {
    if (!selectedLead) return;
    startTransition(async () => {
      const response = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedLead.name,
          stage: selectedLead.stage,
          context: selectedLead.notes ?? "",
        }),
      });
      const data = await response.json();
      setMessage(data.message || getTemplate(selectedLead.stage, selectedLead.name));
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <div>
          <label className="text-sm font-medium">Choose a lead</label>
          <select
            className="mt-2 w-full"
            value={selectedId}
            onChange={(event) => setSelectedId(Number(event.target.value))}
          >
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} · {lead.stage.replace("_", " ")}
              </option>
            ))}
          </select>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleTemplate}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={handleAi}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              disabled={isPending}
            >
              {isPending ? "Generating..." : "Generate with AI"}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            AI generation is optional and falls back to templates if unavailable.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Follow-up message</label>
          <textarea
            className="mt-2 w-full"
            rows={8}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Generate a follow-up message..."
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              onClick={() => navigator.clipboard.writeText(message)}
            >
              Copy
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              onClick={() => setMessage("")}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
