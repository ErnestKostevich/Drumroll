import "server-only";
import { and, asc, desc, eq, gt, gte, sql } from "drizzle-orm";
import { db, ensureSchema } from "./db/client";
import {
  waitlists,
  signups,
  owners,
  DEMO_OWNER_ID,
  type Waitlist,
  type Signup,
  type Owner,
} from "./db/schema";
import { decrypt } from "./crypto";

export type { Waitlist, Signup, Owner };
export { DEMO_OWNER_ID };

export async function getWaitlist(slug: string): Promise<Waitlist | undefined> {
  await ensureSchema();
  const rows = await db
    .select()
    .from(waitlists)
    .where(eq(waitlists.slug, slug))
    .limit(1);
  return rows[0];
}

export async function listSignups(slug: string): Promise<Signup[]> {
  await ensureSchema();
  return db
    .select()
    .from(signups)
    .where(eq(signups.waitlistSlug, slug))
    .orderBy(asc(signups.joinedAt));
}

export async function totalSignups(slug: string): Promise<number> {
  await ensureSchema();
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(signups)
    .where(eq(signups.waitlistSlug, slug));
  return rows[0]?.c ?? 0;
}

export async function positionFor(
  slug: string,
  email: string,
): Promise<number | null> {
  await ensureSchema();
  const list = await listSignups(slug);
  const idx = list.findIndex((s) => s.email === email);
  return idx === -1 ? null : idx + 1;
}

export async function topReferrers(slug: string, n = 3): Promise<Signup[]> {
  await ensureSchema();
  return db
    .select()
    .from(signups)
    .where(and(eq(signups.waitlistSlug, slug), gt(signups.referrals, 0)))
    .orderBy(desc(signups.referrals), asc(signups.joinedAt))
    .limit(n);
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  if (user.length <= 2) return `${user[0] ?? ""}•@${domain}`;
  return `${user.slice(0, 2)}${"•".repeat(Math.min(user.length - 2, 4))}@${domain}`;
}

export async function listWaitlistsForOwner(ownerId: string): Promise<Waitlist[]> {
  await ensureSchema();
  return db
    .select()
    .from(waitlists)
    .where(eq(waitlists.ownerId, ownerId))
    .orderBy(desc(waitlists.createdAt));
}

export async function countWaitlistsForOwner(ownerId: string): Promise<number> {
  await ensureSchema();
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(waitlists)
    .where(eq(waitlists.ownerId, ownerId));
  return rows[0]?.c ?? 0;
}

export async function createWaitlistRow(row: Waitlist): Promise<void> {
  await ensureSchema();
  await db.insert(waitlists).values(row);
}

export async function slugExists(slug: string): Promise<boolean> {
  await ensureSchema();
  const rows = await db
    .select({ s: waitlists.slug })
    .from(waitlists)
    .where(eq(waitlists.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function updateWaitlistCopy(
  ownerId: string,
  slug: string,
  patch: Partial<
    Pick<
      Waitlist,
      | "productName"
      | "tagline"
      | "description"
      | "ctaLabel"
      | "accentEmoji"
      | "accentColor"
      | "perks"
      | "webhookUrl"
      | "welcomeEmailEnabled"
      | "welcomeEmailSubject"
      | "welcomeEmailBody"
      | "welcomeEmailFromName"
      | "welcomeEmailFromEmail"
    >
  >,
): Promise<boolean> {
  await ensureSchema();
  const result = await db
    .update(waitlists)
    .set(patch)
    .where(and(eq(waitlists.slug, slug), eq(waitlists.ownerId, ownerId)));
  const affected =
    (result as unknown as { rowsAffected?: number }).rowsAffected ?? 1;
  return affected > 0;
}

export async function deleteWaitlist(
  ownerId: string,
  slug: string,
): Promise<boolean> {
  await ensureSchema();
  const result = await db
    .delete(waitlists)
    .where(and(eq(waitlists.slug, slug), eq(waitlists.ownerId, ownerId)));
  const affected =
    (result as unknown as { rowsAffected?: number }).rowsAffected ?? 1;
  return affected > 0;
}

export async function addSignup(input: {
  waitlistSlug: string;
  email: string;
  referredBy: string | null;
}): Promise<void> {
  await ensureSchema();
  await db.insert(signups).values({
    waitlistSlug: input.waitlistSlug,
    email: input.email,
    joinedAt: Date.now(),
    referredBy: input.referredBy,
    referrals: 0,
  });

  if (input.referredBy) {
    await db
      .update(signups)
      .set({ referrals: sql`${signups.referrals} + 1` })
      .where(
        and(
          eq(signups.waitlistSlug, input.waitlistSlug),
          eq(signups.email, input.referredBy),
        ),
      );
  }
}

export async function signupExists(
  waitlistSlug: string,
  email: string,
): Promise<boolean> {
  await ensureSchema();
  const rows = await db
    .select({ id: signups.id })
    .from(signups)
    .where(
      and(eq(signups.waitlistSlug, waitlistSlug), eq(signups.email, email)),
    )
    .limit(1);
  return rows.length > 0;
}

/**
 * Return per-day signup counts for the last N days (inclusive of today).
 * Used by the dashboard sparkline.
 */
export async function signupsByDay(
  slug: string,
  days = 14,
): Promise<{ date: string; count: number }[]> {
  await ensureSchema();
  const now = new Date();
  const buckets: { date: string; count: number }[] = [];
  const dateToIndex = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    dateToIndex.set(iso, buckets.length);
    buckets.push({ date: iso, count: 0 });
  }

  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const rows = await db
    .select({ joinedAt: signups.joinedAt })
    .from(signups)
    .where(and(eq(signups.waitlistSlug, slug), gte(signups.joinedAt, since)));

  for (const r of rows) {
    const iso = new Date(r.joinedAt).toISOString().slice(0, 10);
    const idx = dateToIndex.get(iso);
    if (idx !== undefined) buckets[idx].count += 1;
  }

  return buckets;
}

/**
 * Fetch the owner row + decrypted Resend key (or null if not configured).
 */
export async function getOwnerWithResendKey(
  ownerId: string,
): Promise<{ owner: Owner; resendApiKey: string | null } | null> {
  await ensureSchema();
  const rows = await db.select().from(owners).where(eq(owners.id, ownerId)).limit(1);
  const owner = rows[0];
  if (!owner) return null;
  return {
    owner,
    resendApiKey: decrypt(owner.resendApiKeyEncrypted),
  };
}

export async function updateOwnerSettings(
  ownerId: string,
  patch: { resendApiKeyEncrypted?: string | null; defaultFromEmail?: string | null },
): Promise<void> {
  await ensureSchema();
  await db.update(owners).set(patch).where(eq(owners.id, ownerId));
}

export async function getOwnerByEmail(email: string): Promise<Owner | null> {
  await ensureSchema();
  const rows = await db
    .select()
    .from(owners)
    .where(eq(owners.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function linkOwnerEmail(
  ownerId: string,
  email: string,
): Promise<{ ok: true } | { ok: false; reason: "email_in_use" }> {
  await ensureSchema();
  const lower = email.toLowerCase();
  const existing = await getOwnerByEmail(lower);
  if (existing && existing.id !== ownerId) {
    return { ok: false, reason: "email_in_use" };
  }
  await db
    .update(owners)
    .set({ email: lower, emailVerifiedAt: Date.now() })
    .where(eq(owners.id, ownerId));
  return { ok: true };
}

/**
 * Seed the public "Lumen AI" demo. Owned by DEMO_OWNER_ID so it never
 * appears in a real user's dashboard. Idempotent.
 */
export async function ensureDemoSeed(): Promise<void> {
  await ensureSchema();
  const exists = await slugExists("lumen-ai");
  if (exists) return;

  const now = Date.now();
  await db.insert(waitlists).values({
    slug: "lumen-ai",
    ownerId: DEMO_OWNER_ID,
    productName: "Lumen AI",
    tagline: "The AI co-pilot that actually understands your codebase.",
    description:
      "Lumen reads your entire repo, learns your conventions, and writes PRs that pass review on the first try. Join the waitlist for early access.",
    ctaLabel: "Get early access",
    accentEmoji: "✦",
    accentColor: "emerald",
    webhookUrl: null,
    welcomeEmailEnabled: false,
    welcomeEmailSubject: null,
    welcomeEmailBody: null,
    welcomeEmailFromName: null,
    welcomeEmailFromEmail: null,
    perks: [
      "Skip the queue with 1 referral",
      "Lifetime 30% off for the first 500 users",
      "Direct Slack channel with the founders",
    ],
    createdAt: now,
  });

  await db.insert(signups).values([
    {
      waitlistSlug: "lumen-ai",
      email: "founder@vercel.com",
      joinedAt: now - 1000 * 60 * 60 * 24 * 3,
      referredBy: null,
      referrals: 4,
    },
    {
      waitlistSlug: "lumen-ai",
      email: "sarah@linear.app",
      joinedAt: now - 1000 * 60 * 60 * 24 * 2,
      referredBy: null,
      referrals: 2,
    },
    {
      waitlistSlug: "lumen-ai",
      email: "tom@notion.so",
      joinedAt: now - 1000 * 60 * 60 * 24,
      referredBy: null,
      referrals: 1,
    },
  ]);
}
