"use client";

import { useState } from "react";

export function UpgradeCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: "pro" | "team") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        message?: string;
        verifyUrl?: string;
      };
      if (!res.ok) {
        if (data.error === "verify_email" && data.verifyUrl) {
          setError(data.message ?? "Verify your email first.");
          setTimeout(() => {
            window.location.href = data.verifyUrl!;
          }, 1600);
        } else {
          setError(data.error ?? "Checkout failed.");
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        // dev-mode self-serve: page will reload
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/40 bg-gradient-to-br from-brand-soft via-transparent to-accent/10 p-6">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Hobby plan
          </p>
          <p className="mt-2 text-xl font-semibold">
            You&apos;ve hit the Hobby waitlist limit.
          </p>
          <p className="mt-1 text-sm text-muted-strong">
            Upgrade to Pro for unlimited waitlists, 25k signups each, BYOK
            welcome emails, and webhooks. We don&apos;t markup AI tokens —
            BYOK pricing stays.
          </p>
          {error ? (
            <p className="mt-2 text-xs text-danger" aria-live="polite">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => upgrade("pro")}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:opacity-60"
          >
            {loading ? "Loading…" : "Upgrade to Pro · $19/mo"}
          </button>
          <button
            type="button"
            onClick={() => upgrade("team")}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-foreground transition hover:border-brand/50 disabled:opacity-60"
          >
            Team · $49/mo
          </button>
        </div>
      </div>
    </div>
  );
}
