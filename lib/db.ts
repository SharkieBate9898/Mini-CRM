import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.db");
const schemaPath = path.join(process.cwd(), "db", "schema.sql");

let db: Database.Database | null = null;

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const instance = new Database(dbPath);
  instance.pragma("foreign_keys = ON");

  const hasUsersTable = instance
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (!hasUsersTable) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    instance.exec(schema);
  }

  return instance;
}

export function getDb() {
  if (!db) {
    db = ensureDatabase();
  }
  return db;
}

export type LeadStage =
  | "new"
  | "warm"
  | "touring"
  | "offer"
  | "under_contract"
  | "closed";

export type InteractionType = "call" | "text" | "email" | "dm" | "tour" | "note";

export const leadStages: LeadStage[] = [
  "new",
  "warm",
  "touring",
  "offer",
  "under_contract",
  "closed",
];

export const interactionTypes: InteractionType[] = [
  "call",
  "text",
  "email",
  "dm",
  "tour",
  "note",
];
