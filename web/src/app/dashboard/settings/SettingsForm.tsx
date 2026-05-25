"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateOwnerSettingsAction, type MutationState } from "@/app/actions";

const initialState: MutationState = {};

export function SettingsForm({
  hasKey,
  defaultFromEmail,
}: {
  hasKey: boolean;
  defaultFromEmail: string;
}) {
  const [state, formAction] = useActionState(updateOwnerSettingsAction, initialState);
  const [clearing, setClearing] = useState(false);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-border bg-surface/40 p-6"
    >
      <div>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Resend API key
          </span>
          <p className="mt-1 text-xs text-muted">
            Starts with <code className="font-mono">re_</code>. Encrypted at rest.
            {hasKey ? " A key is currently set — paste a new one to replace it." : ""}
          </p>
          <input
            type="password"
            name="resendApiKey"
            autoComplete="off"
            placeholder={hasKey ? "•".repeat(24) + " (set — leave blank to keep)" : "re_..."}
            className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        {hasKey ? (
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-strong">
            <input
              type="checkbox"
              name="clearResendKey"
              checked={clearing}
              onChange={(e) => setClearing(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            <span>Remove the stored key (disables welcome emails)</span>
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Default From email
        </span>
        <p className="mt-1 text-xs text-muted">
          Used as the fallback sender when a waitlist doesn&apos;t override it.
          Must be on a Resend-verified domain.
        </p>
        <input
          type="email"
          name="defaultFromEmail"
          defaultValue={defaultFromEmail}
          placeholder="hello@yourdomain.com"
          className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      {state.ok ? (
        <p className="text-sm text-brand" aria-live="polite">
          ✓ Saved.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-danger" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}
