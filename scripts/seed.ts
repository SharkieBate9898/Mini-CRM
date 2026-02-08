import bcrypt from "bcrypt";
import { getDb } from "../lib/db";
import fs from "fs";
import path from "path";

async function seed() {
  const db = getDb();
  const passwordHash = await bcrypt.hash("password123", 12);

  db.prepare("DELETE FROM sessions").run();
  db.prepare("DELETE FROM interactions").run();
  db.prepare("DELETE FROM leads").run();
  db.prepare("DELETE FROM users").run();

  const user = db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run("demo@mini-crm.local", passwordHash);

  const userId = Number(user.lastInsertRowid);
  const now = new Date();

  const leads = [
    {
      name: "Alex Carter",
      phone: "555-212-3434",
      email: "alex.carter@example.com",
      source: "referral",
      stage: "warm",
      last_contacted_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      next_action_at: new Date(now.getTime() + 2 * 86400000).toISOString(),
      next_action_text: "Send neighborhood market update",
      notes: "Looking for 3 bed, 2 bath near parks.",
    },
    {
      name: "Jordan Lee",
      phone: "555-987-2211",
      email: "jordan.lee@example.com",
      source: "open house",
      stage: "touring",
      last_contacted_at: new Date(now.getTime() - 9 * 86400000).toISOString(),
      next_action_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
      next_action_text: "Confirm tour schedule",
      notes: "Prefers weekend showings.",
    },
    {
      name: "Priya Singh",
      phone: "555-444-7788",
      email: "priya.singh@example.com",
      source: "website",
      stage: "offer",
      last_contacted_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
      next_action_at: new Date(now.getTime() + 1 * 86400000).toISOString(),
      next_action_text: "Review offer adjustments",
      notes: "Considering escalation clause.",
    },
  ];

  const insertLead = db.prepare(
    `INSERT INTO leads
      (user_id, name, phone, email, source, stage, last_contacted_at, next_action_at, next_action_text, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const leadIds = leads.map((lead) => {
    const createdAt = new Date().toISOString();
    const result = insertLead.run(
      userId,
      lead.name,
      lead.phone,
      lead.email,
      lead.source,
      lead.stage,
      lead.last_contacted_at,
      lead.next_action_at,
      lead.next_action_text,
      lead.notes,
      createdAt,
      createdAt
    );
    return Number(result.lastInsertRowid);
  });

  const insertInteraction = db.prepare(
    `INSERT INTO interactions (lead_id, type, content, occurred_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );

  insertInteraction.run(
    leadIds[0],
    "call",
    "Discussed timeline and preferred neighborhoods.",
    new Date(now.getTime() - 2 * 86400000).toISOString(),
    new Date().toISOString()
  );

  insertInteraction.run(
    leadIds[1],
    "text",
    "Sent updated tour schedule for Saturday.",
    new Date(now.getTime() - 1 * 86400000).toISOString(),
    new Date().toISOString()
  );

  insertInteraction.run(
    leadIds[2],
    "email",
    "Shared offer draft and next steps.",
    new Date(now.getTime() - 1 * 86400000).toISOString(),
    new Date().toISOString()
  );

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log("Seed complete. Demo user: demo@mini-crm.local / password123");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
