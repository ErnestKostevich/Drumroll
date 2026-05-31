import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { consumeMagicLink } from "@/lib/magic-link";
import { createOwnerForEmail } from "@/lib/auth";
import { getOwnerByEmail, linkOwnerEmail } from "@/lib/store";

export const runtime = "nodejs";

/**
 * GET /api/auth/verify?token=xxx
 *
 * Validates a magic-link token. Three click outcomes:
 *   - purpose=login → look up owner by email, set cookie, redirect.
 *   - purpose=verify, ownerId set → link email to that owner, set cookie.
 *   - purpose=verify, ownerId null → create owner now (deferred signup),
 *     set cookie.
 *
 * Single-use, 15-min TTL enforced by `consumeMagicLink`.
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
    // First successful inbox roundtrip = verification.
    if (!owner.emailVerifiedAt) {
      await linkOwnerEmail(owner.id, record.email);
    }
    store.set("wk_owner", owner.id, cookieOptions);
    redirect("/dashboard?recovered=1");
  }

  // purpose === "verify"
  if (record.ownerId === null) {
    // Deferred signup — first click also creates the owner.
    let owner = await getOwnerByEmail(record.email);
    if (!owner) {
      try {
        owner = await createOwnerForEmail(record.email);
      } catch {
        // Race: another verify click for the same email already created
        // the owner. Just re-fetch and proceed.
        owner = await getOwnerByEmail(record.email);
      }
    }
    if (!owner) {
      return Response.json(
        { error: "Couldn't create your account. Try again." },
        { status: 500 },
      );
    }
    // Mark verified now if it wasn't already.
    if (!owner.emailVerifiedAt) {
      await linkOwnerEmail(owner.id, record.email);
    }
    store.set("wk_owner", owner.id, cookieOptions);
    redirect("/dashboard?welcome=1");
  } else {
    // Link mode — bind email to the already-existing owner.
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
