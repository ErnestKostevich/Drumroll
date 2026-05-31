"use client";

import { useState } from "react";

export function EmailLinker({
  currentEmail,
  verified,
}: {
  currentEmail: string | null;
  verified: boolean;
}) {
  const [email, setEmail] = useState(currentEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, link: true }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't send link.");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        verified
          ? "rounded-2xl border border-brand/40 bg-brand-soft p-6"
          : "rounded-2xl border border-border bg-surface/40 p-6"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          {verified ? "Email login enabled" : "Enable email login"}
        </p>
        {verified ? (
          <span className="rounded-full bg-brand/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand">
            Verified
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-muted-strong">
        {verified
          ? "Your account is tied to this email. Log in from any browser at /login — magic link to your inbox, no password."
          : "Link an email so you can log in from any device with a magic link. Required before upgrading to Pro — your subscription can't be stolen if it's tied to your inbox."}
      </p>

      {sent ? (
        <p className="mt-4 rounded-lg border border-brand/40 bg-brand-soft/60 p-4 text-sm text-foreground">
          ✓ Verification link sent to <span className="font-mono">{email}</span>.
          Click the link in your inbox to confirm. It expires in 15 minutes.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.com"
            className="h-11 flex-1 rounded-full border border-border-strong bg-background px-5 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:opacity-60"
          >
            {loading ? "Sending…" : verified ? "Change email" : "Send link"}
          </button>
        </form>
      )}
      {error ? (
        <p className="mt-2 text-xs text-danger" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
