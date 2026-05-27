import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db/client";
import { owners } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * Owner recovery: GET /recover/<ownerId> sets the `wk_owner` cookie to the
 * given UUID and redirects to /dashboard. Lets a paying customer regain
 * access on a new browser / after clearing cookies, as long as they saved
 * the URL we showed them at upgrade time.
 *
 * Threat model: the owner ID is a UUIDv4 — unguessable, so knowing the URL
 * IS the access credential. This is the same model as Notion guest links
 * or unguessable invite URLs. Don't share your recovery URL.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ownerId: string }> },
) {
  const { ownerId } = await params;

  // Basic shape check — UUID v4 looks like 8-4-4-4-12 hex
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ownerId)) {
    return Response.json({ error: "Invalid recovery ID format." }, { status: 400 });
  }

  await ensureSchema();
  const rows = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.id, ownerId))
    .limit(1);

  if (rows.length === 0) {
    return Response.json(
      { error: "Recovery ID not found. Did you copy the full URL?" },
      { status: 404 },
    );
  }

  const store = await cookies();
  store.set("wk_owner", ownerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  redirect("/dashboard?recovered=1");
}
