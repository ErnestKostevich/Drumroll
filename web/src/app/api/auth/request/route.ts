import { headers } from "next/headers";
import { getCurrentOwner } from "@/lib/auth";
import { getOwnerByEmail } from "@/lib/store";
import { createMagicLink, buildMagicUrl } from "@/lib/magic-link";
import { magicLinkEmail, sendSystemEmail } from "@/lib/system-email";
import { ipFrom, limit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/csrf";

export const runtime = "nodejs";

type Body = {
  email?: string;
  link?: boolean; // if true, link to current cookie owner instead of logging in
};

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

  // Per-email rate limit (defence-in-depth so a single email can't be spammed)
  const emailGate = limit(`auth-email:${email}`, 5, 60 * 60 * 1000);
  if (!emailGate.ok) {
    return Response.json(
      { error: "Too many requests for this email. Try again later." },
      { status: 429 },
    );
  }

  let purpose: "login" | "verify" = "login";
  let ownerIdForLink: string | null = null;

  if (body.link) {
    // Link mode: attach this email to the current cookie owner.
    const current = await getCurrentOwner();
    if (!current) {
      return Response.json(
        { error: "No active owner cookie. Create a waitlist first." },
        { status: 400 },
      );
    }
    const conflict = await getOwnerByEmail(email);
    if (conflict && conflict.id !== current.id) {
      return Response.json(
        { error: "This email is already linked to another account. Use 'Log in' instead." },
        { status: 409 },
      );
    }
    purpose = "verify";
    ownerIdForLink = current.id;
  } else {
    // Login mode: find an owner by email. If none, fall through silently —
    // we still return ok:true so we don't leak which emails are registered.
    const owner = await getOwnerByEmail(email);
    ownerIdForLink = owner?.id ?? null;
  }

  // Even when no owner exists in login mode, we don't reveal that. We just
  // skip sending the email.
  if (!body.link && !ownerIdForLink) {
    return Response.json({ ok: true, sent: false });
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
