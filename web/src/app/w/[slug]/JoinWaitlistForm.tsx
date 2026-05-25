"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist, type JoinState } from "@/app/actions";

const initialState: JoinState = {};

export function JoinWaitlistForm({
  slug,
  ctaLabel,
  ref,
}: {
  slug: string;
  ctaLabel: string;
  ref: string | null;
}) {
  const [state, formAction] = useActionState(joinWaitlist, initialState);

  if (state.position) {
    return <Joined slug={slug} state={state} />;
  }

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="slug" value={slug} />
      {ref ? <input type="hidden" name="ref" value={ref} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@startup.com"
          autoComplete="email"
          className="h-12 flex-1 rounded-full border border-border-strong bg-background px-5 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <SubmitButton label={ctaLabel} />
      </div>
      {state.error ? (
        <p className="mt-3 text-sm text-danger" aria-live="polite">
          {state.error}
        </p>
      ) : null}
      {ref ? (
        <p className="mt-3 text-xs text-muted">
          You were invited by <span className="text-brand">{ref}</span> — they
          move up a spot when you join.
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Joining…" : label}
    </button>
  );
}

function Joined({ slug, state }: { slug: string; state: JoinState }) {
  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/w/${slug}?ref=${encodeURIComponent(state.email ?? "")}`
      : `/w/${slug}?ref=${encodeURIComponent(state.email ?? "")}`;

  return (
    <div className="rounded-2xl border border-brand/40 bg-brand-soft p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">
        You&apos;re in
      </p>
      <p className="mt-3 text-2xl font-semibold">
        You&apos;re #{state.position} of {state.total}.
      </p>
      <p className="mt-2 text-sm text-muted-strong">
        Want to move up? Share your link — every friend who joins bumps you up
        a spot.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          readOnly
          value={referralUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 flex-1 rounded-full border border-border-strong bg-background px-4 font-mono text-xs text-muted-strong focus:border-brand focus:outline-none"
        />
        <CopyButton url={referralUrl} />
      </div>
    </div>
  );
}

function CopyButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      }}
      className="inline-flex h-11 items-center justify-center rounded-full border border-brand/50 bg-surface px-5 text-sm font-medium text-brand transition hover:bg-brand-soft"
    >
      Copy link
    </button>
  );
}
