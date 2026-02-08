import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getLead, listInteractions } from "@/lib/leads";
import { leadStages, interactionTypes } from "@/lib/db";
import {
  updateStage,
  saveNotes,
  updateNextAction,
  markContacted,
  addLeadInteraction,
} from "@/app/app/leads/[id]/actions";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const leadId = Number(params.id);
  const lead = getLead(user.id, leadId);
  if (!lead) {
    redirect("/app");
  }
  const interactions = listInteractions(user.id, leadId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/app" className="text-sm text-slate-500">
            ← Back to pipeline
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{lead.name}</h1>
          <p className="text-sm text-slate-500">Source: {lead.source}</p>
        </div>
        <form action={updateStage} className="flex items-center gap-2">
          <input type="hidden" name="leadId" value={lead.id} />
          <label className="text-sm font-medium">Stage</label>
          <select name="stage" defaultValue={lead.stage}>
            {leadStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage.replace("_", " ")}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
            Update
          </button>
        </form>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Contact</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <p>Phone: {lead.phone || "Not provided"}</p>
              <p>Email: {lead.email || "Not provided"}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {lead.phone ? (
                <>
                  <a
                    className="rounded-md border border-slate-300 px-3 py-2"
                    href={`tel:${lead.phone}`}
                  >
                    Call
                  </a>
                  <a
                    className="rounded-md border border-slate-300 px-3 py-2"
                    href={`sms:${lead.phone}`}
                  >
                    Text
                  </a>
                </>
              ) : null}
              {lead.email ? (
                <a
                  className="rounded-md border border-slate-300 px-3 py-2"
                  href={`mailto:${lead.email}`}
                >
                  Email
                </a>
              ) : null}
            </div>
            <form action={markContacted} className="mt-4">
              <input type="hidden" name="leadId" value={lead.id} />
              <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                Mark Contacted Today
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Next Action</h2>
            <form action={updateNextAction} className="mt-3 space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <div>
                <label className="text-sm font-medium">Next action date</label>
                <input
                  type="date"
                  name="next_action_at"
                  defaultValue={lead.next_action_at?.split("T")[0]}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Next action detail</label>
                <input
                  name="next_action_text"
                  defaultValue={lead.next_action_text ?? ""}
                  className="mt-2 w-full"
                  placeholder="Call about open house results"
                />
              </div>
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                Save Next Action
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Notes</h2>
            <form action={saveNotes} className="mt-3 space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <textarea
                name="notes"
                defaultValue={lead.notes ?? ""}
                rows={4}
                className="w-full"
                placeholder="Add notes about preferences, timelines, or deal details..."
              />
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                Save Notes
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Log Interaction</h2>
            <form action={addLeadInteraction} className="mt-3 space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <div>
                <label className="text-sm font-medium">Type</label>
                <select name="type" className="mt-2 w-full">
                  {interactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <input type="date" name="occurred_at" className="mt-2 w-full" />
              </div>
              <div>
                <label className="text-sm font-medium">Summary</label>
                <textarea
                  name="content"
                  className="mt-2 w-full"
                  rows={3}
                  placeholder="Summary of the conversation or note"
                  required
                />
              </div>
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                Add Interaction
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Interactions</h2>
            <div className="mt-3 space-y-3">
              {interactions.length === 0 ? (
                <p className="text-sm text-slate-400">No interactions yet.</p>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-400">
                      {interaction.type} · {new Date(interaction.occurred_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{interaction.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
