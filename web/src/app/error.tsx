"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[wk] unhandled error", error);
  }, [error]);

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-radial-brand" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
        <Logo />
        <div className="my-auto py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-danger">
            Something broke
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            We hit a bump on the server.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-muted-strong">
            The error has been logged. Try again, or head back home and we&apos;ll
            keep your spot.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-muted">
              ref: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
            >
              Try again
            </button>
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
