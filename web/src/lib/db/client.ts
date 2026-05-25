import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const globalForDb = globalThis as unknown as {
  __waitlistkitDb?: ReturnType<typeof drizzle<typeof schema>>;
  __waitlistkitDbInitialized?: boolean;
};

const client = createClient({ url, authToken });

export const db =
  globalForDb.__waitlistkitDb ??
  (globalForDb.__waitlistkitDb = drizzle({ client, schema }));

const CREATE_WAITLISTS = `CREATE TABLE IF NOT EXISTS waitlists (
  slug TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  accent_emoji TEXT NOT NULL,
  perks TEXT NOT NULL,
  created_at INTEGER NOT NULL
);`;

const CREATE_SIGNUPS = `CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  waitlist_slug TEXT NOT NULL REFERENCES waitlists(slug) ON DELETE CASCADE,
  email TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  referred_by TEXT,
  referrals INTEGER NOT NULL DEFAULT 0
);`;

const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS signups_slug_idx ON signups(waitlist_slug);`,
  `CREATE INDEX IF NOT EXISTS signups_slug_email_idx ON signups(waitlist_slug, email);`,
];

export async function ensureSchema(): Promise<void> {
  if (globalForDb.__waitlistkitDbInitialized) return;
  await client.execute(CREATE_WAITLISTS);
  await client.execute(CREATE_SIGNUPS);
  for (const stmt of CREATE_INDEXES) {
    await client.execute(stmt);
  }
  globalForDb.__waitlistkitDbInitialized = true;
}

export { schema };
