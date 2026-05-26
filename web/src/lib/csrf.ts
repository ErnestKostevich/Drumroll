import "server-only";

/**
 * Lightweight CSRF check for mutating Route Handlers that rely on
 * cookie-based ownership. Server Actions get framework-level CSRF for free,
 * but `app/api/*` POST handlers don't, so a cross-site form/fetch could
 * piggy-back on the user's cookie.
 *
 * Strategy:
 * - Trust modern browsers' Sec-Fetch-Site header. Reject if cross-site.
 * - Fall back to Origin/Host comparison.
 * - Allow no-origin requests (curl, server-to-server) so the endpoint is
 *   still usable from non-browser clients.
 */
export function isSameOriginRequest(req: Request): boolean {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "same-site") return true;
  if (fetchSite === "none") return true; // user typed URL / opened directly
  if (fetchSite === "cross-site") return false;

  const origin = req.headers.get("origin");
  if (!origin) return true; // curl, server-to-server — no browser CSRF surface

  const host = req.headers.get("host");
  if (!host) return false;

  try {
    const o = new URL(origin);
    return o.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}
