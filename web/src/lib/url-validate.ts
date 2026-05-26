import "server-only";

/**
 * Reject URLs that point to private/internal networks to prevent SSRF.
 * Used for owner-supplied webhook URLs.
 *
 * Returns null if the URL is safe, or an error string describing why not.
 */
export function rejectInternalUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Invalid URL format.";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "URL must be http or https.";
  }

  // Reject obvious local hostnames before DNS resolution.
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local")
  ) {
    return "Local/internal hosts are not allowed.";
  }

  // Reject literal private IPv4 ranges and link-local.
  if (isPrivateIpv4(host)) {
    return "Private IP ranges are not allowed.";
  }

  // Reject IPv6 loopback / link-local / unique-local.
  if (isPrivateIpv6(host)) {
    return "Private IPv6 ranges are not allowed.";
  }

  return null;
}

function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [, a, b] = m.map(Number);
  // 0.x, 10.x, 127.x, 169.254.x (link-local incl. AWS metadata),
  // 172.16-31.x, 192.168.x, 100.64-127.x (CGNAT)
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(host: string): boolean {
  // Bracketed form: [::1] → ::1
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique-local
  if (h.startsWith("fe80:")) return true; // link-local
  return false;
}
