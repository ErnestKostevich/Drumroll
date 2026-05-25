"use client";

import Link from "next/link";
import { useState } from "react";

export function OwnerBanner({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/w/${slug}`
      : `/w/${slug}`;

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="border-b border-brand/30 bg-brand-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-ink">
            ✓
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your waitlist is live.
            </p>
            <p className="text-xs text-muted-strong">
              This is exactly what your visitors will see. Share the link below.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-md border border-border-strong bg-background px-3 py-1.5 font-mono text-xs text-muted-strong">
            {shareUrl}
          </code>
          <button
            onClick={copy}
            type="button"
            className="inline-flex h-8 items-center rounded-full bg-brand px-3 text-xs font-semibold text-brand-ink transition hover:bg-brand-strong"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center rounded-full border border-border-strong bg-surface px-3 text-xs font-medium text-foreground transition hover:border-brand/50"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
