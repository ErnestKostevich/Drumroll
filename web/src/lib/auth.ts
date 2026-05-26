import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "./db/client";
import { owners, type Owner } from "./db/schema";

const COOKIE = "wk_owner";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Node 18+ / modern edge runtimes always expose webcrypto. If we got here,
  // we're on something exotic and should fail rather than mint a guessable ID.
  throw new Error("crypto.randomUUID unavailable; refusing to generate a guessable owner ID.");
}

async function findOwner(id: string): Promise<Owner | null> {
  await ensureSchema();
  const rows = await db.select().from(owners).where(eq(owners.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Read-only: return the current owner if their cookie is present and the
 * owner row exists. Returns null otherwise. Safe in Server Components.
 */
export async function getCurrentOwner(): Promise<Owner | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;
  return findOwner(id);
}

/**
 * Mutating: ensures a row in `owners` and sets the cookie. Must be called
 * from a Server Action or Route Handler (cookies() is writable there).
 */
export async function getOrCreateOwner(): Promise<Owner> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;

  if (id) {
    const existing = await findOwner(id);
    if (existing) return existing;
  }

  await ensureSchema();
  const newId = id ?? generateId();
  const now = Date.now();
  await db
    .insert(owners)
    .values({ id: newId, plan: "hobby", createdAt: now })
    .onConflictDoNothing();

  if (!id || id !== newId) {
    store.set(COOKIE, newId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE,
    });
  }

  const created = await findOwner(newId);
  if (!created) throw new Error("Failed to create owner");
  return created;
}

/**
 * Replace the current owner's plan. Called by the NOWPayments webhook
 * handler when a payment confirms, and by the dev-mode self-serve upgrade.
 */
export async function setOwnerPlan(
  ownerId: string,
  plan: Owner["plan"],
  patch: Partial<Pick<Owner, "stripeCustomerId" | "stripeSubscriptionId" | "planRenewsAt">> = {},
): Promise<void> {
  await ensureSchema();
  await db.update(owners).set({ plan, ...patch }).where(eq(owners.id, ownerId));
}

/**
 * The plan that should be enforced right now. NOWPayments invoices cover
 * 30 days; if `planRenewsAt` is in the past, we fall back to hobby until
 * the owner pays again.
 */
export function effectivePlan(owner: Pick<Owner, "plan" | "planRenewsAt">): Owner["plan"] {
  if (owner.plan === "hobby") return "hobby";
  if (owner.planRenewsAt === null || owner.planRenewsAt === undefined) {
    return owner.plan; // recurring (Stripe) — no expiry
  }
  return owner.planRenewsAt > Date.now() ? owner.plan : "hobby";
}
