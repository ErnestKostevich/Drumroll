import "server-only";

/**
 * Tiny in-memory sliding-window rate limiter. Resets when the process
 * restarts (fine for an MVP). Swap with Upstash Redis or Vercel KV if
 * we need cross-instance limits later.
 */
type Bucket = { count: number; resetAt: number };

const globalForRl = globalThis as unknown as {
  __waitlistkitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalForRl.__waitlistkitBuckets ??
  (globalForRl.__waitlistkitBuckets = new Map<string, Bucket>());

export type LimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function limit(
  key: string,
  max: number,
  windowMs: number,
): LimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Extract an IP from request headers. Falls back to "unknown" so we still
 * bucket abusive traffic (just lumped together).
 */
export function ipFrom(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
