import Link from "next/link";
import { CreateWaitlistForm } from "@/components/CreateWaitlistForm";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div className="absolute inset-0 bg-radial-brand" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.1fr_1fr] md:gap-16 md:pt-24 lg:pb-28 lg:pt-32">
        <div className="animate-fade-up">
          <Link
            href="https://github.com/ErnestKostevich/Project-1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 font-mono text-xs text-muted-strong transition hover:border-brand/50 hover:text-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            v0.0.1 — now in public beta
          </Link>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Beautiful waitlists
            <br />
            <span className="text-gradient">for AI startups.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-strong">
            AI-generated copy. Viral referral loops. Real analytics.
            Launch a waitlist your founders won&apos;t be embarrassed to
            share — live in 60 seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="#create"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-semibold text-brand-ink transition hover:bg-brand-strong"
            >
              Launch a waitlist — free
            </Link>
            <Link
              href="/w/lumen-ai"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-surface/60 px-5 text-muted-strong transition hover:border-brand/50 hover:text-foreground"
            >
              See live demo →
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
            <Stat label="Avg conv rate" value="38%" />
            <Stat label="Setup time" value="< 60s" />
            <Stat label="Cost" value="$0 to start" />
          </dl>
        </div>

        <div className="relative animate-fade-up md:[animation-delay:120ms]">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-brand/30 via-transparent to-accent/30 blur-2xl" />
          <div className="relative">
            <CreateWaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl text-foreground">{value}</dd>
      <dt className="mt-1 text-xs uppercase tracking-widest text-muted">{label}</dt>
    </div>
  );
}
