import { headers } from "next/headers";
import {
  addSignup,
  getWaitlist,
  positionFor,
  signupExists,
  totalSignups,
} from "@/lib/store";
import { PLAN_LIMITS } from "@/lib/db/schema";
import { db, ensureSchema } from "@/lib/db/client";
import { owners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ipFrom, limit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function jsonCors(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

type Body = { slug?: string; email?: string; ref?: string };

export async function POST(req: Request) {
  const h = await headers();
  const ip = ipFrom(h);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonCors({ error: "Invalid JSON body." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const referredBy = (body.ref ?? "").trim() || null;

  if (!slug) return jsonCors({ error: "Missing slug." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonCors({ error: "That email doesn't look right." }, { status: 400 });
  }

  const gate = limit(`embed-join:${slug}:${ip}`, 60, 60 * 1000);
  if (!gate.ok) {
    return jsonCors(
      { error: "Too many attempts. Try again in a minute." },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil((gate.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const wl = await getWaitlist(slug);
  if (!wl) return jsonCors({ error: "Waitlist not found." }, { status: 404 });

  // Plan cap enforcement (same as joinWaitlist server action)
  if (wl.ownerId !== "demo") {
    await ensureSchema();
    const ownerRow = (
      await db.select().from(owners).where(eq(owners.id, wl.ownerId)).limit(1)
    )[0];
    if (ownerRow) {
      const cap = PLAN_LIMITS[ownerRow.plan].maxSignupsPerWaitlist;
      const total = await totalSignups(slug);
      if (total >= cap) {
        return jsonCors(
          { error: "This waitlist has hit its signup cap." },
          { status: 403 },
        );
      }
    }
  }

  if (await signupExists(slug, email)) {
    const total = await totalSignups(slug);
    const position = (await positionFor(slug, email)) ?? total;
    return jsonCors({ position, total, email });
  }

  await addSignup({ waitlistSlug: slug, email, referredBy });

  if (wl.webhookUrl) {
    fetch(wl.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "signup.created",
        waitlist: slug,
        email,
        referredBy,
        source: "embed",
        joinedAt: Date.now(),
      }),
    }).catch(() => {});
  }

  const total = await totalSignups(slug);
  const position = (await positionFor(slug, email)) ?? total;
  return jsonCors({ position, total, email });
}
