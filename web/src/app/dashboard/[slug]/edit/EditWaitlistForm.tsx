"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { updateWaitlist, type MutationState } from "@/app/actions";
import type { Waitlist } from "@/lib/store";
import { ACCENT_PALETTE, type AccentColor } from "@/lib/db/schema";

const EMOJIS = ["✦", "◆", "▲", "❋", "✺", "◈", "◉", "❖"];
const ACCENT_KEYS = Object.keys(ACCENT_PALETTE) as AccentColor[];

const initialState: MutationState = {};

const DEFAULT_SUBJECT = "You're on the {{product}} waitlist (#{{position}})";
const DEFAULT_BODY =
  `Thanks for joining the {{product}} waitlist.\n\nYou're #{{position}} of {{total}}. We'll email you the moment we open the gates.\n\n— The team`;

export function EditWaitlistForm({ waitlist }: { waitlist: Waitlist }) {
  const [state, formAction] = useActionState(updateWaitlist, initialState);
  const [emailOn, setEmailOn] = useState(waitlist.welcomeEmailEnabled);

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

      <div>
        <span className="block font-mono text-xs uppercase tracking-widest text-muted">
          Accent color
        </span>
        <p className="mt-1 text-xs text-muted">
          Drives the hero glow, CTA button, and OG image. Marketing site stays
          emerald regardless.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACCENT_KEYS.map((c) => {
            const p = ACCENT_PALETTE[c];
            return (
              <label
                key={c}
                title={p.label}
                className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-border-strong transition hover:border-foreground has-[:checked]:border-foreground"
                style={{ background: p.brand }}
              >
                <input
                  type="radio"
                  name="accentColor"
                  value={c}
                  defaultChecked={waitlist.accentColor === c}
                  className="sr-only"
                />
                <span
                  className="absolute -bottom-5 text-[10px] uppercase tracking-widest text-muted opacity-0 transition group-hover:opacity-100 has-[:checked]:opacity-100"
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                >
                  {p.label}
                </span>
              </label>
            );
          })}
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
        help="We POST signup events here. JSON payload: { type, waitlist, email, referredBy, source, joinedAt }."
        type="url"
        required={false}
      />

      <fieldset className="space-y-4 rounded-xl border border-border-strong bg-background/40 p-5">
        <legend className="px-2 font-mono text-xs uppercase tracking-widest text-brand">
          Welcome email
        </legend>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="welcomeEmailEnabled"
            checked={emailOn}
            onChange={(e) => setEmailOn(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          <span className="text-foreground">
            Send a welcome email when someone joins
          </span>
        </label>
        <p className="text-xs text-muted">
          Requires a Resend API key on your{" "}
          <Link
            href="/dashboard/settings"
            className="text-brand underline-offset-4 hover:underline"
          >
            owner settings
          </Link>
          . Templates support{" "}
          <code className="font-mono">{`{{product}}`}</code>,{" "}
          <code className="font-mono">{`{{position}}`}</code>,{" "}
          <code className="font-mono">{`{{total}}`}</code>,{" "}
          <code className="font-mono">{`{{email}}`}</code>.
        </p>

        {emailOn ? (
          <>
            <Field
              label="Subject"
              name="welcomeEmailSubject"
              defaultValue={waitlist.welcomeEmailSubject ?? DEFAULT_SUBJECT}
              required={false}
            />
            <TextareaField
              label="Body (plain text, becomes paragraphs)"
              name="welcomeEmailBody"
              defaultValue={waitlist.welcomeEmailBody ?? DEFAULT_BODY}
              rows={6}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="From name (optional)"
                name="welcomeEmailFromName"
                defaultValue={waitlist.welcomeEmailFromName ?? ""}
                required={false}
                help="Defaults to product name."
              />
              <Field
                label="From email (optional)"
                name="welcomeEmailFromEmail"
                defaultValue={waitlist.welcomeEmailFromEmail ?? ""}
                required={false}
                type="email"
                help="Defaults to your owner settings."
              />
            </div>
          </>
        ) : null}
      </fieldset>

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
      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
