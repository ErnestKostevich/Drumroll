import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { consumeMagicLink } from "@/lib/magic-link";
import { getOwnerByEmail, linkOwnerEmail } from "@/lib/store";

export const runtime = "nodejs";

/**
 * GET /api/auth/verify?token=xxx
 *
 * Validates a magic-link token. Two modes:
 *   - purpose=login → looks up owner by email, sets `wk_owner` cookie to it,
 *     redirects to /dashboard.
 *   - purpose=verify → links the email to the link's stored ownerId,
 *     redirects to /dashboard/settings.
 *
 * Tokens are single-use and expire in 15 minutes.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Missing token." }, { status: 400 });
  }

  const record = await consumeMagicLink(token);
  if (!record) {
    return Response.json(
      { error: "This link is expired or already used. Request a new one." },
      { status: 400 },
    );
  }

  const store = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };

  if (record.purpose === "login") {
    const owner = await getOwnerByEmail(record.email);
    if (!owner) {
      return Response.json(
        { error: "Owner no longer exists." },
        { status: 404 },
      );
    }
    // First-time successful login also doubles as email verification.
    if (!owner.emailVerifiedAt) {
      await linkOwnerEmail(owner.id, record.email);
    }
    store.set("wk_owner", owner.id, cookieOptions);
    redirect("/dashboard?recovered=1");
  } else {
    // verify mode: ownerId is whatever owner requested the link
    if (!record.ownerId) {
      return Response.json(
        { error: "Verification link missing owner reference." },
        { status: 400 },
      );
    }
    const result = await linkOwnerEmail(record.ownerId, record.email);
    if (!result.ok) {
      return Response.json(
        { error: "That email is already linked to another account." },
        { status: 409 },
      );
    }
    store.set("wk_owner", record.ownerId, cookieOptions);
    redirect("/dashboard/settings?verified=1");
  }
}
