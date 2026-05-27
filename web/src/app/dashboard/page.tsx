import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignupSparkline } from "@/components/SignupSparkline";
import { UpgradeCard } from "./UpgradeCard";
import { RecoveryNotice } from "./RecoveryNotice";
import {
  ensureDemoSeed,
  listWaitlistsForOwner,
  signupsByDay,
  totalSignups,
} from "@/lib/store";
import { effectivePlan, getCurrentOwner } from "@/lib/auth";
import { ACCENT_PALETTE, PLAN_LIMITS, type AccentColor } from "@/lib/db/schema";

type Row = {
  slug: string;
  total: number;
  today: number;
  last14: { date: string; count: number }[];
};

type Search = { upgraded?: string; recovered?: string; upgrade?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await ensureDemoSeed();
  const owner = await getCurrentOwner();
  const search = await searchParams;
  const showUpgradedBanner = search.upgraded === "1" && !!owner;
  const showRecoveredBanner = search.recovered === "1" && !!owner;

  const waitlists = owner ? await listWaitlistsForOwner(owner.id) : [];

  const rows: Row[] = await Promise.all(
    waitlists.map(async (w) => {
      const [total, days] = await Promise.all([
        totalSignups(w.slug),
        signupsByDay(w.slug, 14),
      ]);
      return {
        slug: w.slug,
        total,
        today: days[days.length - 1]?.count ?? 0,
        last14: days,
      };
    }),
  );
  const rowMap = new Map(rows.map((r) => [r.slug, r]));
  const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);
  const todayTotal = rows.reduce((acc, r) => acc + r.today, 0);
  const last7Total = rows.reduce(
    (acc, r) => acc + r.last14.slice(-7).reduce((a, b) => a + b.count, 0),
    0,
  );

  const plan = owner ? effectivePlan(owner) : "hobby";
  const limits = PLAN_LIMITS[plan];
  const planLabel = plan === "hobby" ? "Hobby" : plan === "pro" ? "Pro" : "Team";
  const planTone =
    plan === "hobby"
      ? "border-border-strong bg-surface text-muted-strong"
      : "border-brand/40 bg-brand-soft text-brand";
  const renewsAt = owner?.planRenewsAt ?? null;
  const daysRemaining =
    renewsAt && plan !== "hobby"
      ? Math.max(0, Math.ceil((renewsAt - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

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
                href="/dashboard/settings"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-foreground transition hover:border-brand/50"
              >
                Settings
              </Link>
              <Link
                href="/#create"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
              >
                + New waitlist
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StatCard
              label="Total signups"
              value={String(grandTotal)}
              hint="across your waitlists"
            />
            <StatCard
              label="Today"
              value={String(todayTotal)}
              hint={`${last7Total} in the last 7 days`}
            />
            <StatCard
              label="Current plan"
              value={planLabel}
              hint={
                daysRemaining !== null
                  ? `${planHint(plan)} · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                  : planHint(plan)
              }
            />
          </div>

          {showUpgradedBanner && owner ? (
            <div className="mt-8">
              <RecoveryNotice ownerId={owner.id} variant="upgraded" />
            </div>
          ) : null}

          {showRecoveredBanner && owner ? (
            <div className="mt-8">
              <RecoveryNotice ownerId={owner.id} variant="recovered" />
            </div>
          ) : null}

          {plan === "hobby" && waitlists.length >= 1 ? (
            <div className="mt-8">
              <UpgradeCard />
            </div>
          ) : null}

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface/40">
            <div className="hidden grid-cols-[1.5fr_140px_0.8fr_0.8fr_auto] gap-4 border-b border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted sm:grid">
              <span>Product</span>
              <span>Last 14 days</span>
              <span>Signups</span>
              <span>Created</span>
              <span className="sr-only">Actions</span>
            </div>

            {waitlists.length === 0 ? (
              <EmptyDashboard />
            ) : (
              <ul>
                {waitlists.map((wl) => {
                  const row = rowMap.get(wl.slug);
                  const total = row?.total ?? 0;
                  const overCap = total >= limits.maxSignupsPerWaitlist;
                  const palette = ACCENT_PALETTE[wl.accentColor as AccentColor];
                  return (
                    <li
                      key={wl.slug}
                      className="grid grid-cols-1 gap-3 border-b border-border/60 px-6 py-5 last:border-b-0 sm:grid-cols-[1.5fr_140px_0.8fr_0.8fr_auto] sm:items-center sm:gap-4"
                      style={
                        {
                          "--color-brand": palette.brand,
                          "--color-brand-strong": palette.strong,
                          "--color-brand-soft": palette.soft,
                          "--color-brand-ink": palette.ink,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-md text-xs"
                            style={{ background: palette.soft, color: palette.brand }}
                          >
                            {wl.accentEmoji}
                          </span>
                          {wl.productName}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-muted">
                          {wl.tagline}
                        </p>
                      </div>
                      <div>
                        <SignupSparkline data={row?.last14 ?? []} width={140} height={32} />
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                          {row?.today ?? 0} today
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
                      <div className="flex flex-wrap gap-2">
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
                          className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-strong"
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

          {owner ? (
            <p className="mt-6 text-xs text-muted">
              Owner ID:{" "}
              <code className="font-mono text-foreground">{owner.id}</code>{" "}
              — bookmark this browser to keep access. Multi-device auth coming
              when paying customers ask for it.
            </p>
          ) : null}
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
        className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
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
