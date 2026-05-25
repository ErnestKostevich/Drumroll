import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="relative flex flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-radial-brand" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
        <Logo />
        <div className="my-auto py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            404
          </p>
          <h1 className="mt-3 text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            That waitlist doesn&apos;t exist
            <br />
            <span className="text-gradient">— yet.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-muted-strong">
            The link might be old, mistyped, or the founder pulled it. Want to
            launch your own?
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#create"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
            >
              Launch a waitlist →
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-surface/60 px-5 text-sm text-muted-strong transition hover:border-brand/50 hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
