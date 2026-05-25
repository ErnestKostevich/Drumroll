"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createWaitlist, type CreateState } from "@/app/actions";

const initialState: CreateState = {};

export function CreateWaitlistForm({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const [state, formAction] = useActionState(createWaitlist, initialState);

  const isHero = variant === "hero";

  return (
    <form
      id="create"
      action={formAction}
      className={
        isHero
          ? "w-full rounded-2xl border border-border bg-surface/80 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-6"
          : "w-full rounded-2xl border border-border bg-surface/60 p-6"
      }
    >
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Product name
        </span>
        <input
          type="text"
          name="productName"
          required
          minLength={2}
          maxLength={60}
          placeholder="Lumen AI"
          className="mt-2 w-full rounded-lg border border-border-strong bg-background px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <label className="mt-4 block">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          What does it do? <span className="text-muted/60">(one sentence)</span>
        </span>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={240}
          rows={3}
          placeholder="An AI co-pilot that reads your entire codebase and writes PRs that pass review on the first try."
          className="mt-2 w-full resize-none rounded-lg border border-border-strong bg-background px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      {state.error ? (
        <p className="mt-3 text-sm text-danger" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          ✦ AI generates copy, perks, and a viral referral loop.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Launching…" : "Launch waitlist →"}
    </button>
  );
}
