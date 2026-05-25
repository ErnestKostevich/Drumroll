import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getWaitlist, listSignups, ensureDemoSeed } from "@/lib/store";
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
  ensureDemoSeed();
  const wl = getWaitlist(slug);
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
  ensureDemoSeed();

  const wl = getWaitlist(slug);
  if (!wl) notFound();

  const signups = listSignups(slug);
  const total = signups.length;
  const isOwner = search.owner === "1";
  const ref = search.ref ?? null;

  return (
    <>
      {isOwner ? <OwnerBanner slug={slug} /> : null}
      <main className="relative flex-1 overflow-hidden">
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
          </div>
        </div>
      </main>
    </>
  );
}
