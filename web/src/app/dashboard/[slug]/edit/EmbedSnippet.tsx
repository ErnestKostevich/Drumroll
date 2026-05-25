"use client";

import { useEffect, useState } from "react";

export function EmbedSnippet({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("https://waitlistkit.com");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const snippet = `<div data-waitlist="${slug}"></div>
<script src="${origin}/embed.js" async></script>`;

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Embed
          </p>
          <p className="mt-2 font-medium text-foreground">
            Drop this on your own site
          </p>
          <p className="mt-1 text-sm text-muted-strong">
            Two tags. No framework, no CSS, no bundler. Signups still flow
            into this waitlist — including referral tracking via{" "}
            <code className="font-mono text-xs text-brand">?ref=…</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex-shrink-0 rounded-full border border-brand/40 bg-brand-soft px-4 py-2 text-xs font-medium text-brand transition hover:border-brand/60"
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-border-strong bg-background p-4 text-xs leading-relaxed text-muted-strong">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
