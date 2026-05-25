import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ensureDemoSeed,
  getWaitlist,
  maskEmail,
  topReferrers,
  totalSignups,
} from "@/lib/store";
import { ACCENT_PALETTE } from "@/lib/db/schema";
import { Logo } from "@/components/Logo";
import { JoinWaitlistForm } from "./JoinWaitlistForm";
import { OwnerBanner } from "./OwnerBanner";

type Params = { slug: string };
type Search = { ref?: string; owner?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  await ensureDemoSeed();
  const wl = await getWaitlist(slug);
  if (!wl) return { title: "Waitlist not found" };
  return {
    title: `${wl.productName} — join the waitlist`,
    description: wl.tagline,
    openGraph: {
      title: `${wl.productName} — join the waitlist`,
      description: wl.tagline,
    },
  };
}

export default async function WaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  await ensureDemoSeed();

  const wl = await getWaitlist(slug);
  if (!wl) notFound();

  const total = await totalSignups(slug);
  const top = await topReferrers(slug, 3);
  const isOwner = search.owner === "1";
  const ref = search.ref ?? null;

  const palette = ACCENT_PALETTE[wl.accentColor];
  const accentStyle = {
    "--color-brand": palette.brand,
    "--color-brand-strong": palette.strong,
    "--color-brand-soft": palette.soft,
    "--color-brand-ink": palette.ink,
  } as CSSProperties;

  return (
    <>
      {isOwner ? <OwnerBanner slug={slug} /> : null}
      <main
        className="relative flex-1 overflow-hidden"
        style={accentStyle}
      >
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-radial-brand" aria-hidden />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col px-6 py-10">
          <div className="flex items-center justify-between">
            <Logo />
            <Link
              href="/"
              className="text-xs text-muted transition hover:text-foreground"
            >
              Powered by WaitlistKit
            </Link>
          </div>

          <div className="my-auto py-16 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/40 bg-brand-soft text-2xl text-brand">
              {wl.accentEmoji}
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              {wl.productName}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-strong md:text-xl">
              {wl.tagline}
            </p>

            <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted">
              {wl.description}
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <JoinWaitlistForm slug={slug} ctaLabel={wl.ctaLabel} ref={ref} />
              <p className="mt-3 text-xs text-muted">
                {total > 0
                  ? `Join ${total} ${total === 1 ? "founder" : "founders"} already on the list.`
                  : "Be the first to join."}
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
              {wl.perks.map((perk) => (
                <div
                  key={perk}
                  className="rounded-xl border border-border bg-surface/40 p-4"
                >
                  <span className="font-mono text-xs uppercase tracking-widest text-brand">
                    Perk
                  </span>
                  <p className="mt-2 text-sm text-muted-strong">{perk}</p>
                </div>
              ))}
            </div>

            {top.length > 0 ? (
              <div className="mx-auto mt-10 max-w-xl text-left">
                <p className="font-mono text-xs uppercase tracking-widest text-brand">
                  Top referrers
                </p>
                <ol className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface/40">
                  {top.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-4 px-4 py-3 text-sm"
                    >
                      <span
                        className={
                          i === 0
                            ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-ink font-mono text-xs font-semibold"
                            : "inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface text-muted-strong font-mono text-xs"
                        }
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 font-mono text-xs text-muted-strong">
                        {maskEmail(s.email)}
                      </span>
                      <span className="font-mono text-xs text-brand">
                        {s.referrals} invite{s.referrals === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-muted">
                  Refer a friend — each signup bumps you up the queue.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
