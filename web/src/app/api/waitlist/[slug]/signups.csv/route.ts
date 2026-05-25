import { getCurrentOwner } from "@/lib/auth";
import { getWaitlist, listSignups } from "@/lib/store";

export const runtime = "nodejs";

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const owner = await getCurrentOwner();
  if (!owner) {
    return Response.json({ error: "Not signed in to this browser." }, { status: 401 });
  }

  const wl = await getWaitlist(slug);
  if (!wl) {
    return Response.json({ error: "Waitlist not found." }, { status: 404 });
  }
  if (wl.ownerId !== owner.id) {
    return Response.json({ error: "Not your waitlist." }, { status: 403 });
  }

  const signups = await listSignups(slug);

  const header = ["position", "email", "joined_at_iso", "referred_by", "referrals"].join(",");
  const lines = signups.map((s, i) =>
    [
      i + 1,
      csvEscape(s.email),
      csvEscape(new Date(s.joinedAt).toISOString()),
      csvEscape(s.referredBy ?? ""),
      s.referrals,
    ].join(","),
  );
  const body = [header, ...lines].join("\n") + "\n";

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}-signups-${Date.now()}.csv"`,
      "cache-control": "no-store",
    },
  });
}
