"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email }),
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

  if (sent) {
    return (
      <div className="rounded-xl border border-brand/40 bg-brand-soft p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Check your inbox
        </p>
        <p className="mt-2 text-sm text-foreground">
          Magic link sent to <span className="font-mono">{email}</span>. Click
          it within 15 minutes to log in. If you&apos;re new, the same link
          creates your account — no separate signup needed.
        </p>
        <p className="mt-2 text-xs text-muted">
          Didn&apos;t get it? Check spam, then{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-brand underline-offset-4 hover:underline"
          >
            request again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@startup.com"
          className="mt-2 w-full rounded-lg border border-border-strong bg-background px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>
      {error ? (
        <p className="text-xs text-danger" aria-live="polite">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
