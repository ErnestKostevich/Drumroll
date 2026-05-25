import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { store, ensureDemoSeed } from "@/lib/store";

export default async function DashboardPage() {
  ensureDemoSeed();
  const waitlists = Array.from(store.waitlists.values()).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand">
                Dashboard
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Your waitlists
              </h1>
              <p className="mt-2 text-muted-strong">
                {waitlists.length === 0
                  ? "You haven't launched anything yet."
                  : `${waitlists.length} live waitlist${waitlists.length === 1 ? "" : "s"}.`}
              </p>
            </div>
            <Link
              href="/#create"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
            >
              + New waitlist
            </Link>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface/40">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted">
              <span>Product</span>
              <span>Signups</span>
              <span>Created</span>
              <span className="sr-only">Open</span>
            </div>

            {waitlists.length === 0 ? (
              <div className="px-6 py-16 text-center text-muted">
                Launch your first waitlist to see it here.
              </div>
            ) : (
              <ul>
                {waitlists.map((wl) => {
                  const total = store.signups.get(wl.slug)?.length ?? 0;
                  const isDemo = wl.slug === "lumen-ai";
                  return (
                    <li
                      key={wl.slug}
                      className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-5 last:border-b-0"
                    >
                      <div>
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          {wl.accentEmoji} {wl.productName}
                          {isDemo ? (
                            <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand">
                              demo
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-muted">
                          {wl.tagline}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-lg text-foreground">
                          {total}
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
            <StatCard label="Total signups" value={String(totalAcross(waitlists.map((w) => w.slug)))} hint="across all waitlists" />
            <StatCard label="Conversion (avg)" value="38%" hint="email submit rate" />
            <StatCard label="Top channel" value="X / Twitter" hint="from referrer logs" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function totalAcross(slugs: string[]): number {
  return slugs.reduce(
    (acc, s) => acc + (store.signups.get(s)?.length ?? 0),
    0,
  );
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
