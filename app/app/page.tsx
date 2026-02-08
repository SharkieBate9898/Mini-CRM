import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { leadStages } from "@/lib/db";
import { listLeads, listSources, listReminders } from "@/lib/leads";
import QuickAddLead from "@/components/QuickAddLead";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { search?: string; source?: string; sort?: string };
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const leads = listLeads({
    userId: user.id,
    search: searchParams.search,
    source: searchParams.source,
    sort: searchParams.sort === "created" ? "created" : "next_action",
  });
  const sources = listSources(user.id).map((row) => row.source);
  const { overdue, stale } = listReminders(user.id);

  const grouped = leadStages.reduce<Record<string, typeof leads>>((acc, stage) => {
    acc[stage] = leads.filter((lead) => lead.stage === stage);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pipeline Board</h1>
          <p className="text-sm text-slate-500">
            Track every lead across your real estate pipeline.
          </p>
        </div>
        <QuickAddLead />
      </div>

      <form className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Search</label>
          <input
            name="search"
            defaultValue={searchParams.search}
            className="mt-2 w-full"
            placeholder="Search by name, email, or phone"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Source</label>
          <select
            name="source"
            defaultValue={searchParams.source ?? "all"}
            className="mt-2 w-full"
          >
            <option value="all">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Sort</label>
          <select
            name="sort"
            defaultValue={searchParams.sort ?? "next_action"}
            className="mt-2 w-full"
          >
            <option value="next_action">Next action</option>
            <option value="created">Newest</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Apply
        </button>
      </form>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 overflow-x-auto pb-2" style={{ gridAutoFlow: "column" }}>
          {leadStages.map((stage) => (
            <div
              key={stage}
              className="min-w-[260px] rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold capitalize">
                  {stage.replace("_", " ")}
                </h2>
                <span className="text-xs text-slate-500">
                  {grouped[stage]?.length ?? 0}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {grouped[stage]?.length ? (
                  grouped[stage].map((lead) => {
                    const lastContacted = lead.last_contacted_at
                      ? new Date(lead.last_contacted_at)
                      : null;
                    const stale =
                      lastContacted &&
                      Date.now() - lastContacted.getTime() > 7 * 24 * 60 * 60 * 1000;

                    return (
                      <Link
                        key={lead.id}
                        href={`/app/leads/${lead.id}`}
                        className="block rounded-md border border-slate-200 p-3 hover:border-slate-400"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{lead.name}</p>
                          {stale ? (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                              Stale
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.source} · Next action:{" "}
                          {lead.next_action_at
                            ? new Date(lead.next_action_at).toLocaleDateString()
                            : "Not scheduled"}
                        </p>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No leads yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">Reminders</h3>
            <p className="text-xs text-slate-500">
              Overdue actions and stale conversations.
            </p>
            <div className="mt-3 space-y-3">
              {overdue.length === 0 && stale.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing urgent right now.</p>
              ) : null}
              {overdue.map((lead) => (
                <Link
                  key={`overdue-${lead.id}`}
                  href={`/app/leads/${lead.id}`}
                  className="block rounded-md border border-red-200 bg-red-50 p-3"
                >
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-red-700">
                    Overdue: {lead.next_action_text || "Follow up"}
                  </p>
                </Link>
              ))}
              {stale.map((lead) => (
                <Link
                  key={`stale-${lead.id}`}
                  href={`/app/leads/${lead.id}`}
                  className="block rounded-md border border-amber-200 bg-amber-50 p-3"
                >
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-amber-700">
                    Stale: last contacted{" "}
                    {lead.last_contacted_at
                      ? new Date(lead.last_contacted_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">Tips</h3>
            <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-slate-500">
              <li>Schedule next actions for every active lead.</li>
              <li>Use the follow-up generator for quick outreach.</li>
              <li>Keep notes after every call or tour.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
