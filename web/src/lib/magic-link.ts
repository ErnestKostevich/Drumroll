import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db, ensureSchema } from "./db/client";
import { magicLinks } from "./db/schema";

const TTL_MS = 15 * 60 * 1000; // 15 minutes

type Purpose = "login" | "verify";

export type MagicLinkRecord = {
  email: string;
  purpose: Purpose;
  ownerId: string | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a single-use magic link token. The raw token goes in the URL we
 * email to the user; only its SHA-256 hash is stored in the DB.
 */
export async function createMagicLink(input: {
  email: string;
  purpose: Purpose;
  ownerId: string | null;
}): Promise<string> {
  await ensureSchema();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = Date.now();

  // Best-effort cleanup of expired/used links for this email so the table
  // doesn't grow unbounded.
  await db.delete(magicLinks).where(
    and(
      eq(magicLinks.email, input.email),
      lt(magicLinks.expiresAt, now),
    ),
  ).catch(() => {});

  await db.insert(magicLinks).values({
    tokenHash,
    email: input.email,
    purpose: input.purpose,
    ownerId: input.ownerId,
    expiresAt: now + TTL_MS,
    usedAt: null,
    createdAt: now,
  });

  return token;
}

/**
 * Verify a magic link token. Returns the link record if valid and marks it
 * as used. Returns null if not found, expired, or already used.
 */
export async function consumeMagicLink(token: string): Promise<MagicLinkRecord | null> {
  await ensureSchema();
  const tokenHash = hashToken(token);
  const now = Date.now();

  const rows = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        gt(magicLinks.expiresAt, now),
        isNull(magicLinks.usedAt),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  await db
    .update(magicLinks)
    .set({ usedAt: now })
    .where(eq(magicLinks.tokenHash, tokenHash));

  return {
    email: row.email,
    purpose: row.purpose,
    ownerId: row.ownerId,
  };
}

export function buildMagicUrl(origin: string, token: string): string {
  return `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;
}
