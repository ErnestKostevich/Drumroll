import { headers } from "next/headers";
import { createOwnerForEmail, getCurrentOwner } from "@/lib/auth";
import { getOwnerByEmail } from "@/lib/store";
import { createMagicLink, buildMagicUrl } from "@/lib/magic-link";
import { magicLinkEmail, sendSystemEmail } from "@/lib/system-email";
import { ipFrom, limit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/csrf";

export const runtime = "nodejs";

type Body = { email?: string };

/**
 * Universal magic-link endpoint. Figures out intent from cookie context:
 *
 *   - No cookie + email is new      → create owner, send "verify" link  (SIGNUP)
 *   - No cookie + email exists      → send "login" link to that owner   (LOGIN)
 *   - Has cookie, owner has no email
 *     and email is free             → send "verify" link, attaches on click (LINK)
 *   - Has cookie, email belongs to
 *     a different owner             → 409 "use Log in instead"
 *   - Has cookie + email belongs to
 *     same owner                    → send "verify" link (re-confirmation)
 *
 * All success paths return { ok: true, sent: true }. Never reveals whether
 * an email was already registered (no enumeration leak).
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

  let purpose: "login" | "verify";
  let ownerIdForLink: string;

  if (currentOwner) {
    // User has a cookie. Either link or re-verify.
    if (existingByEmail && existingByEmail.id !== currentOwner.id) {
      return Response.json(
        {
          error:
            "That email belongs to a different account. Log out of this browser first, then log in with that email.",
        },
        { status: 409 },
      );
    }
    purpose = "verify";
    ownerIdForLink = currentOwner.id;
  } else if (existingByEmail) {
    // Returning user.
    purpose = "login";
    ownerIdForLink = existingByEmail.id;
  } else {
    // Brand-new signup.
    const fresh = await createOwnerForEmail(email);
    purpose = "verify";
    ownerIdForLink = fresh.id;
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
    return Response.json(
      { error: `Couldn't send email: ${result.error}` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, sent: true });
}
