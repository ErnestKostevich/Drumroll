"use client";

import { useEffect, useState } from "react";

type Variant = "upgraded" | "recovered" | "always";

export function RecoveryNotice({
  ownerId,
  variant,
}: {
  ownerId: string;
  variant: Variant;
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://drumroll.app");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const recoveryUrl = `${origin}/recover/${ownerId}`;

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(recoveryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const heading =
    variant === "upgraded"
      ? "🥁 Welcome to Pro. Save this URL now."
      : variant === "recovered"
        ? "Welcome back."
        : "Your recovery URL";

  const body =
    variant === "upgraded"
      ? "Your account lives in a browser cookie. If you ever clear cookies, switch browsers, or use a new device — paste this URL in any address bar to get back in. Save it in 1Password, your notes, or just bookmark it."
      : variant === "recovered"
        ? "Cookie restored. You're back on the same account."
        : "Save this URL. It's the only way back into your account if you clear cookies, switch browsers, or use a new device. Treat it like a password.";

  return (
    <div
      role="region"
      aria-label={variant === "upgraded" ? "Recovery URL after upgrade" : "Recovery URL"}
      className={
        variant === "upgraded"
          ? "rounded-2xl border border-brand bg-brand-soft p-6 glow-brand"
          : "rounded-2xl border border-border bg-surface/40 p-6"
      }
    >
      <p
        className={
          variant === "upgraded"
            ? "font-semibold text-foreground"
            : "font-mono text-xs uppercase tracking-widest text-brand"
        }
      >
        {heading}
      </p>
      <p className="mt-2 text-sm text-muted-strong">{body}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          readOnly
          value={recoveryUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 flex-1 rounded-full border border-border-strong bg-background px-4 font-mono text-xs text-muted-strong focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}
