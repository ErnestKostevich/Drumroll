"use client";

import { useState, useTransition } from "react";
import { deleteWaitlistAction } from "@/app/actions";

export function DangerZone({ slug }: { slug: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-danger">
        Danger zone
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="font-medium text-foreground">Delete this waitlist</p>
            <a
              href={`/api/waitlist/${slug}/signups.csv`}
              className="rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:border-brand/50"
            >
              Export signups (CSV)
            </a>
          </div>
          <p className="mt-1 text-sm text-muted-strong">
            Permanently removes the waitlist and all signups. Download a CSV
            first if you need the data.
          </p>
        </div>
        {confirming ? (
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-foreground transition hover:border-brand/50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await deleteWaitlistAction(slug);
                });
              }}
              className="inline-flex h-10 items-center justify-center rounded-full bg-danger px-4 text-sm font-semibold text-white transition hover:bg-danger/80 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Yes, delete forever"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex-shrink-0 inline-flex h-10 items-center justify-center rounded-full border border-danger/40 bg-danger/10 px-4 text-sm font-medium text-danger transition hover:bg-danger/20"
          >
            Delete waitlist
          </button>
        )}
      </div>
    </div>
  );
}
