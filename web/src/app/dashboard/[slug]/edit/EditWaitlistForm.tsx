"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { updateWaitlist, type MutationState } from "@/app/actions";
import type { Waitlist } from "@/lib/store";

const EMOJIS = ["✦", "◆", "▲", "❋", "✺", "◈", "◉", "❖"];

const initialState: MutationState = {};

export function EditWaitlistForm({ waitlist }: { waitlist: Waitlist }) {
  const [state, formAction] = useActionState(updateWaitlist, initialState);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-border bg-surface/40 p-6"
    >
      <input type="hidden" name="slug" value={waitlist.slug} />

      <Field label="Product name" name="productName" defaultValue={waitlist.productName} />
      <Field label="Tagline" name="tagline" defaultValue={waitlist.tagline} />

      <TextareaField
        label="Description"
        name="description"
        defaultValue={waitlist.description}
        rows={3}
        help="2 sentences max. Shown under the tagline on the public page."
      />

      <Field
        label="CTA button label"
        name="ctaLabel"
        defaultValue={waitlist.ctaLabel}
        help="Max 30 chars. Examples: “Get early access”, “Claim your spot”."
      />

      <div>
        <span className="block font-mono text-xs uppercase tracking-widest text-muted">
          Accent glyph
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <label
              key={e}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-background text-lg transition hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand"
            >
              <input
                type="radio"
                name="accentEmoji"
                value={e}
                defaultChecked={waitlist.accentEmoji === e}
                className="sr-only"
              />
              {e}
            </label>
          ))}
        </div>
      </div>

      <TextareaField
        label="Perks (one per line, max 5)"
        name="perks"
        defaultValue={waitlist.perks.join("\n")}
        rows={4}
        help="What signups get for joining. Specific > generic."
      />

      <Field
        label="Webhook URL (optional)"
        name="webhookUrl"
        defaultValue={waitlist.webhookUrl ?? ""}
        help="We POST signup events here. JSON payload: { type, waitlist, email, referredBy, joinedAt }."
        type="url"
        required={false}
      />

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

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Link
          href={`/w/${waitlist.slug}`}
          target="_blank"
          className="text-sm text-muted transition hover:text-foreground"
        >
          Preview live page ↗
        </Link>
        <SaveButton />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 w-full rounded-lg border border-border-strong bg-background px-4 py-2.5 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      {help ? <p className="mt-1.5 text-xs text-muted">{help}</p> : null}
    </label>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-2 w-full resize-none rounded-lg border border-border-strong bg-background px-4 py-2.5 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      {help ? <p className="mt-1.5 text-xs text-muted">{help}</p> : null}
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
