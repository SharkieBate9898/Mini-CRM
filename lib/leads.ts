import { getDb, LeadStage, InteractionType } from "@/lib/db";

export type Lead = {
  id: number;
  user_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  stage: LeadStage;
  last_contacted_at: string | null;
  next_action_at: string | null;
  next_action_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Interaction = {
  id: number;
  lead_id: number;
  type: InteractionType;
  content: string;
  occurred_at: string;
  created_at: string;
};

export function listLeads(params: {
  userId: number;
  search?: string;
  source?: string;
  sort?: "next_action" | "created";
}) {
  const db = getDb();
  const conditions = ["user_id = ?"];
  const values: (string | number)[] = [params.userId];

  if (params.search) {
    conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${params.search}%`;
    values.push(like, like, like);
  }

  if (params.source && params.source !== "all") {
    conditions.push("source = ?");
    values.push(params.source);
  }

  const orderBy =
    params.sort === "created"
      ? "created_at DESC"
      : "CASE WHEN next_action_at IS NULL THEN 1 ELSE 0 END, next_action_at ASC";

  const query = `SELECT * FROM leads WHERE ${conditions.join(" AND ")} ORDER BY ${orderBy}`;
  return db.prepare(query).all(...values) as Lead[];
}

export function getLead(userId: number, leadId: number) {
  const db = getDb();
  return db
    .prepare("SELECT * FROM leads WHERE id = ? AND user_id = ?")
    .get(leadId, userId) as Lead | undefined;
}

export function listInteractions(userId: number, leadId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT interactions.*
       FROM interactions
       JOIN leads ON leads.id = interactions.lead_id
       WHERE leads.user_id = ? AND leads.id = ?
       ORDER BY occurred_at DESC`
    )
    .all(userId, leadId) as Interaction[];
}

export function createLead(userId: number, data: {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO leads (user_id, name, phone, email, source, stage, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'new', ?, ?)`
  );
  const result = stmt.run(
    userId,
    data.name,
    data.phone ?? null,
    data.email ?? null,
    data.source ?? "unknown",
    now,
    now
  );
  return result.lastInsertRowid as number;
}

export function updateLead(userId: number, leadId: number, data: Partial<{
  stage: LeadStage;
  last_contacted_at: string | null;
  next_action_at: string | null;
  next_action_text: string | null;
  notes: string | null;
  phone: string | null;
  email: string | null;
}>) {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value ?? null);
  });

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());

  values.push(leadId, userId);

  const query = `UPDATE leads SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  db.prepare(query).run(...values);
}

export function addInteraction(userId: number, leadId: number, data: {
  type: InteractionType;
  content: string;
  occurred_at?: string;
}) {
  const db = getDb();
  const lead = getLead(userId, leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }
  db.prepare(
    `INSERT INTO interactions (lead_id, type, content, occurred_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    leadId,
    data.type,
    data.content,
    data.occurred_at ?? new Date().toISOString(),
    new Date().toISOString()
  );
}

export function listSources(userId: number) {
  const db = getDb();
  return db
    .prepare("SELECT DISTINCT source FROM leads WHERE user_id = ? ORDER BY source ASC")
    .all(userId) as { source: string }[];
}

export function listReminders(userId: number) {
  const db = getDb();
  const overdue = db
    .prepare(
      `SELECT * FROM leads
       WHERE user_id = ? AND next_action_at IS NOT NULL AND datetime(next_action_at) < datetime('now')
       ORDER BY next_action_at ASC`
    )
    .all(userId) as Lead[];

  const stale = db
    .prepare(
      `SELECT * FROM leads
       WHERE user_id = ? AND last_contacted_at IS NOT NULL
       AND datetime(last_contacted_at) < datetime('now', '-7 days')
       ORDER BY last_contacted_at ASC`
    )
    .all(userId) as Lead[];

  return { overdue, stale };
}
