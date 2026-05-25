import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, ensureSchema } from "./db/client";
import {
  waitlists,
  signups,
  DEMO_OWNER_ID,
  type Waitlist,
  type Signup,
} from "./db/schema";

export type { Waitlist, Signup };
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
      "productName" | "tagline" | "description" | "ctaLabel" | "accentEmoji" | "perks" | "webhookUrl"
    >
  >,
): Promise<boolean> {
  await ensureSchema();
  const result = await db
    .update(waitlists)
    .set(patch)
    .where(and(eq(waitlists.slug, slug), eq(waitlists.ownerId, ownerId)));
  // libSQL returns affected rows on `rowsAffected`
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
 * Seed the public "Lumen AI" demo. Owned by the special DEMO_OWNER_ID
 * so it never appears in a real user's dashboard. Idempotent.
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
    webhookUrl: null,
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
