"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "wk_cookie_notice_v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      // storage blocked — never show banner
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl shadow-black/50 backdrop-blur sm:left-6 sm:right-auto sm:bottom-6 sm:p-5">
      <p className="text-sm text-muted-strong">
        We set a single first-party cookie (<code className="font-mono text-xs text-brand">wk_owner</code>)
        so your dashboard shows only your waitlists. No third-party
        analytics, no advertising trackers. Details in our{" "}
        <Link href="/legal/privacy" className="text-brand underline-offset-4 hover:underline">
          privacy notice
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 items-center justify-center rounded-full bg-brand px-4 text-xs font-semibold text-brand-ink transition hover:bg-brand-strong"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
