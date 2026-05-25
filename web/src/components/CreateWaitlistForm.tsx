"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createWaitlist, type CreateState } from "@/app/actions";
import { useApiKey } from "@/lib/use-api-key";
import { ConnectAiModal } from "./ConnectAiModal";

type GeneratedCopy = {
  tagline: string;
  longDescription: string;
  ctaLabel: string;
  accentEmoji: string;
  perks: string[];
};

const initialState: CreateState = {};

export function CreateWaitlistForm({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const [state, formAction] = useActionState(createWaitlist, initialState);
  const { apiKey, loaded } = useApiKey();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isHero = variant === "hero";

  async function generate() {
    setAiError(null);
    if (productName.trim().length < 2) {
      setAiError("Add a product name first.");
      return;
    }
    if (description.trim().length < 10) {
      setAiError("Describe the product in at least one sentence first.");
      return;
    }
    if (!apiKey) {
      setModalOpen(true);
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-anthropic-key": apiKey,
        },
        body: JSON.stringify({ productName, description }),
      });
      const data = (await res.json()) as { copy?: GeneratedCopy; error?: string };
      if (!res.ok || !data.copy) {
        setAiError(data.error ?? "AI call failed.");
      } else {
        setCopy(data.copy);
      }
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Network error talking to /api/ai/generate.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
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
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="An AI co-pilot that reads your entire codebase and writes PRs that pass review on the first try."
            className="mt-2 w-full resize-none rounded-lg border border-border-strong bg-background px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={aiLoading}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-brand/40 bg-brand-soft px-3 text-xs font-medium text-brand transition hover:border-brand/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {aiLoading ? "Thinking…" : copy ? "✨ Regenerate" : "✨ Generate with AI"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs text-muted transition hover:text-foreground"
          >
            {loaded && apiKey ? "AI: connected" : "AI: connect key"}
          </button>
        </div>

        {aiError ? (
          <p className="mt-2 text-xs text-danger" aria-live="polite">
            {aiError}
          </p>
        ) : null}

        {copy ? <CopyPreview copy={copy} onClear={() => setCopy(null)} /> : null}

        {/* Hidden fields carrying the AI copy through to the server action.
            If absent, the server action falls back to a template. */}
        {copy ? (
          <>
            <input type="hidden" name="tagline" value={copy.tagline} />
            <input type="hidden" name="longDescription" value={copy.longDescription} />
            <input type="hidden" name="ctaLabel" value={copy.ctaLabel} />
            <input type="hidden" name="accentEmoji" value={copy.accentEmoji} />
            <input type="hidden" name="perks" value={JSON.stringify(copy.perks)} />
          </>
        ) : null}

        {state.error ? (
          <p className="mt-3 text-sm text-danger" aria-live="polite">
            {state.error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {copy
              ? "AI copy ready. Click launch when you're happy."
              : apiKey
                ? "Skip AI to use a clean template."
                : "Works without AI — bring your own key for richer copy."}
          </p>
          <SubmitButton />
        </div>
      </form>

      <ConnectAiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnected={() => void generate()}
      />
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Launching…" : "Launch waitlist →"}
    </button>
  );
}

function CopyPreview({
  copy,
  onClear,
}: {
  copy: GeneratedCopy;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-brand/30 bg-brand-soft/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          AI preview
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted transition hover:text-foreground"
        >
          Use template instead
        </button>
      </div>
      <p className="text-sm font-medium text-foreground">
        {copy.accentEmoji} {copy.tagline}
      </p>
      <p className="text-xs leading-relaxed text-muted-strong">
        {copy.longDescription}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {copy.perks.map((p, i) => (
          <span
            key={i}
            className="rounded-md border border-border-strong bg-background px-2 py-0.5 text-[11px] text-muted-strong"
          >
            {p}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted">
        CTA button: <span className="font-mono text-foreground">{copy.ctaLabel}</span>
      </p>
    </div>
  );
}
