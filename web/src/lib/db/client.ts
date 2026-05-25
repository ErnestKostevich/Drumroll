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

const CREATE_OWNERS = `CREATE TABLE IF NOT EXISTS owners (
  id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'hobby',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_renews_at INTEGER,
  resend_api_key_encrypted TEXT,
  default_from_email TEXT,
  created_at INTEGER NOT NULL
);`;

const CREATE_WAITLISTS = `CREATE TABLE IF NOT EXISTS waitlists (
  slug TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL DEFAULT 'demo',
  product_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  accent_emoji TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT 'emerald',
  perks TEXT NOT NULL,
  webhook_url TEXT,
  welcome_email_enabled INTEGER NOT NULL DEFAULT 0,
  welcome_email_subject TEXT,
  welcome_email_body TEXT,
  welcome_email_from_name TEXT,
  welcome_email_from_email TEXT,
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
  `CREATE INDEX IF NOT EXISTS signups_joined_idx ON signups(joined_at);`,
  `CREATE INDEX IF NOT EXISTS waitlists_owner_idx ON waitlists(owner_id);`,
];

async function tryAddColumn(
  table: string,
  column: string,
  type: string,
  defaultValue?: string,
) {
  const defaultClause = defaultValue !== undefined ? ` DEFAULT ${defaultValue}` : "";
  try {
    await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}${defaultClause};`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/duplicate column name/i.test(msg)) {
      throw err;
    }
  }
}

export async function ensureSchema(): Promise<void> {
  if (globalForDb.__waitlistkitDbInitialized) return;
  await client.execute(CREATE_OWNERS);
  await client.execute(CREATE_WAITLISTS);
  await client.execute(CREATE_SIGNUPS);

  // Migrations for existing installs
  await tryAddColumn("waitlists", "owner_id", "TEXT NOT NULL", "'demo'");
  await tryAddColumn("waitlists", "webhook_url", "TEXT");
  await tryAddColumn("waitlists", "accent_color", "TEXT NOT NULL", "'emerald'");
  await tryAddColumn("waitlists", "welcome_email_enabled", "INTEGER NOT NULL", "0");
  await tryAddColumn("waitlists", "welcome_email_subject", "TEXT");
  await tryAddColumn("waitlists", "welcome_email_body", "TEXT");
  await tryAddColumn("waitlists", "welcome_email_from_name", "TEXT");
  await tryAddColumn("waitlists", "welcome_email_from_email", "TEXT");
  await tryAddColumn("owners", "stripe_customer_id", "TEXT");
  await tryAddColumn("owners", "stripe_subscription_id", "TEXT");
  await tryAddColumn("owners", "plan_renews_at", "INTEGER");
  await tryAddColumn("owners", "resend_api_key_encrypted", "TEXT");
  await tryAddColumn("owners", "default_from_email", "TEXT");

  for (const stmt of CREATE_INDEXES) {
    await client.execute(stmt);
  }
  globalForDb.__waitlistkitDbInitialized = true;
}

export { schema };
