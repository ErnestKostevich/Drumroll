import Link from "next/link";

export function NoOwnerNotice() {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">
        Nothing here yet
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Launch your first waitlist
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-strong">
        Owner settings (Resend API key, default sender email) appear here once
        you&apos;ve created at least one waitlist in this browser.
      </p>
      <Link
        href="/#create"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
      >
        + Create your first waitlist
      </Link>
    </div>
  );
}
