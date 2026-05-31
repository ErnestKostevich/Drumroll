import { headers } from "next/headers";
import { getCurrentOwner } from "@/lib/auth";
import { getOwnerByEmail } from "@/lib/store";
import { createMagicLink, buildMagicUrl } from "@/lib/magic-link";
import { magicLinkEmail, sendSystemEmail } from "@/lib/system-email";
import { ipFrom, limit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/csrf";

export const runtime = "nodejs";

type Body = { email?: string };

/**
 * Universal magic-link endpoint. Figures out intent from cookie context.
 *
 *   - No cookie + email is new      → "verify" link, ownerId=null  (deferred SIGNUP — owner is created when the link is clicked)
 *   - No cookie + email exists      → "login" link to that owner   (LOGIN)
 *   - Has cookie + email is free    → "verify" link, attaches on click (LINK)
 *   - Has cookie + email belongs to
 *     a different owner             → ok:true returned anyway to avoid
 *                                     enumeration; nothing is sent
 *   - Has cookie + same email       → "verify" re-confirmation link
 *
 * Owners are NEVER created at request time — only at verify time, after the
 * user proves they own the inbox. This prevents an attacker with rotating
 * IPs from flooding the `owners` table with empty rows.
 */
export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return Response.json({ error: "Cross-site requests not allowed." }, { status: 403 });
  }

  const ip = ipFrom(req.headers);
  const gate = limit(`auth-request:${ip}`, 10, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const emailGate = limit(`auth-email:${email}`, 5, 60 * 60 * 1000);
  if (!emailGate.ok) {
    return Response.json(
      { error: "Too many requests for this email. Try again later." },
      { status: 429 },
    );
  }

  const currentOwner = await getCurrentOwner();
  const existingByEmail = await getOwnerByEmail(email);

  // Decide purpose + the ownerId we'll write into the magic_link row.
  // ownerId may be null for the signup path — verify will create the owner.
  let purpose: "login" | "verify";
  let ownerIdForLink: string | null;

  if (currentOwner) {
    if (existingByEmail && existingByEmail.id !== currentOwner.id) {
      // Don't 409 — that leaks "this email is registered". Just no-op the
      // send so the response shape matches every other path. The user will
      // get no email; if they retry from a logged-out tab the LOGIN path
      // takes over.
      return Response.json({ ok: true, sent: true });
    }
    purpose = "verify";
    ownerIdForLink = currentOwner.id;
  } else if (existingByEmail) {
    purpose = "login";
    ownerIdForLink = existingByEmail.id;
  } else {
    purpose = "verify";
    ownerIdForLink = null; // deferred signup
  }

  const token = await createMagicLink({ email, purpose, ownerId: ownerIdForLink });

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (host ? `${proto}://${host}` : "https://waitlistkit-three.vercel.app");
  const url = buildMagicUrl(origin, token);

  const { subject, html } = magicLinkEmail({ link: url, purpose });
  const result = await sendSystemEmail({ to: email, subject, html });
  if (!result.ok) {
    // Log the upstream error server-side; never echo it to the client. The
    // raw Resend error sometimes contains the account-owner's email or
    // domain hints — info disclosure.
    console.error("[wk/auth] system email send failed:", result.error);
    return Response.json(
      { error: "Couldn't send the email right now. Try again in a minute." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, sent: true });
}
