import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UpgradeCard } from "./UpgradeCard";
import {
  ensureDemoSeed,
  listWaitlistsForOwner,
  totalSignups,
} from "@/lib/store";
import { getCurrentOwner } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/db/schema";

export default async function DashboardPage() {
  await ensureDemoSeed();
  const owner = await getCurrentOwner();

  const waitlists = owner ? await listWaitlistsForOwner(owner.id) : [];

  const counts = await Promise.all(
    waitlists.map(async (w) => ({ slug: w.slug, count: await totalSignups(w.slug) })),
  );
  const countMap = new Map(counts.map((c) => [c.slug, c.count]));
  const grandTotal = counts.reduce((acc, c) => acc + c.count, 0);

  const plan = owner?.plan ?? "hobby";
  const limits = PLAN_LIMITS[plan];
  const planLabel = plan === "hobby" ? "Hobby" : plan === "pro" ? "Pro" : "Team";
  const planTone =
    plan === "hobby"
      ? "border-border-strong bg-surface text-muted-strong"
      : "border-brand/40 bg-brand-soft text-brand";

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs uppercase tracking-widest text-brand">
                  Dashboard
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${planTone}`}
                >
                  {planLabel}
                </span>
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Your waitlists
              </h1>
              <p className="mt-2 text-muted-strong">
                {!owner
                  ? "You haven't launched anything yet from this browser."
                  : waitlists.length === 0
                    ? "You haven't launched anything yet."
                    : `${waitlists.length} of ${limits.maxWaitlists === 200 ? "unlimited" : limits.maxWaitlists} waitlist${waitlists.length === 1 ? "" : "s"}.`}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/#create"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
              >
                + New waitlist
              </Link>
            </div>
          </div>

          {plan === "hobby" && waitlists.length >= 1 ? (
            <div className="mt-8">
              <UpgradeCard />
            </div>
          ) : null}

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface/40">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted">
              <span>Product</span>
              <span>Signups</span>
              <span>Created</span>
              <span className="sr-only">Actions</span>
            </div>

            {waitlists.length === 0 ? (
              <EmptyDashboard />
            ) : (
              <ul>
                {waitlists.map((wl) => {
                  const total = countMap.get(wl.slug) ?? 0;
                  const overCap = total >= limits.maxSignupsPerWaitlist;
                  return (
                    <li
                      key={wl.slug}
                      className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-5 last:border-b-0"
                    >
                      <div>
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          {wl.accentEmoji} {wl.productName}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-muted">
                          {wl.tagline}
                        </p>
                      </div>
                      <div>
                        <p
                          className={
                            overCap
                              ? "font-mono text-lg text-danger"
                              : "font-mono text-lg text-foreground"
                          }
                        >
                          {total}
                          <span className="ml-1 text-xs text-muted">
                            / {limits.maxSignupsPerWaitlist >= 250_000 ? "∞" : limits.maxSignupsPerWaitlist}
                          </span>
                        </p>
                        <p className="text-xs text-muted">signups</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-strong">
                          {formatDate(wl.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/w/${wl.slug}`}
                          className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand/50"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/${wl.slug}/edit`}
                          className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand/50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/w/${wl.slug}?owner=1`}
                          className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-[#04140d] transition hover:bg-brand-strong"
                        >
                          Share
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <StatCard
              label="Total signups"
              value={String(grandTotal)}
              hint="across your waitlists"
            />
            <StatCard label="Current plan" value={planLabel} hint={planHint(plan)} />
            <StatCard
              label="Owner ID"
              value={owner ? owner.id.slice(0, 8) + "…" : "—"}
              hint="bookmark this browser to keep access"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function EmptyDashboard() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">
        Nothing yet
      </p>
      <p className="mt-3 text-xl font-medium text-foreground">
        Launch your first waitlist
      </p>
      <p className="mt-2 text-sm text-muted">
        It takes 30 seconds. AI is optional (bring your own Anthropic key).
      </p>
      <Link
        href="/#create"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
      >
        + Create waitlist
      </Link>
    </div>
  );
}

function planHint(plan: "hobby" | "pro" | "team"): string {
  if (plan === "hobby") return "1 waitlist · 500 signups";
  if (plan === "pro") return "unlimited waitlists · 25k signups each";
  return "team plan · everything unlimited";
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}
