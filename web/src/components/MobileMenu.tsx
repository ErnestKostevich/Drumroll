"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const LINKS: { href: string; label: string }[] = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/login", label: "Log in" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal target only exists on the client.
  useEffect(() => setMounted(true), []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The drawer is rendered via a portal to <body> so it escapes the header's
  // `backdrop-filter` containing block — otherwise `fixed inset-0` would be
  // sized to the 56px header, not the viewport, and the content would spill
  // over the page with no background behind it.
  const drawer = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: "#07090c" }}
    >
      <div className="flex h-14 items-center justify-between border-b border-border/60 px-6">
        <span className="font-mono text-sm font-medium tracking-tight text-foreground">
          Drumroll<span className="text-brand">menu</span>
        </span>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong bg-surface text-foreground transition hover:border-brand/50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-6 py-6">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="rounded-xl border border-transparent px-4 py-4 text-lg font-medium text-foreground transition hover:border-border-strong hover:bg-surface"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border/60 px-6 py-6">
        <Link
          href="/#create"
          onClick={() => setOpen(false)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-ink transition hover:bg-brand-strong"
        >
          Launch a waitlist
        </Link>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong bg-surface/60 text-foreground transition hover:border-brand/50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {mounted && open ? createPortal(drawer, document.body) : null}
    </div>
  );
}
