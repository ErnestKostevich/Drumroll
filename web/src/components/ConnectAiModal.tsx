"use client";

import { useEffect, useState } from "react";
import { useApiKey, maskKey } from "@/lib/use-api-key";

export function ConnectAiModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}) {
  const { apiKey, setApiKey } = useApiKey();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setValue("");
    setError(null);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function save() {
    const trimmed = value.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("That doesn't look like an Anthropic key. It should start with `sk-ant-`.");
      return;
    }
    if (trimmed.length < 30) {
      setError("Key looks too short.");
      return;
    }
    setApiKey(trimmed);
    onConnected?.();
    onClose();
  }

  function disconnect() {
    setApiKey(null);
    setValue("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect Anthropic API key"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-surface-elevated hover:text-foreground"
        >
          ✕
        </button>

        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Bring your own key
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Connect Anthropic
        </h2>
        <p className="mt-2 text-sm text-muted-strong">
          Paste your Anthropic API key. It&apos;s stored only in your browser
          (localStorage) and passed straight to Anthropic on each AI call. We
          never log it.
        </p>

        {apiKey ? (
          <div className="mt-5 rounded-lg border border-brand/40 bg-brand-soft p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              Connected
            </p>
            <p className="mt-2 font-mono text-sm text-foreground">
              {maskKey(apiKey)}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={disconnect}
                className="rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-medium text-foreground transition hover:border-danger/50 hover:text-danger"
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition hover:bg-brand-strong"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="mt-5 block">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                API key
              </span>
              <input
                type="password"
                autoComplete="off"
                placeholder="sk-ant-api03-..."
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                }}
                className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            {error ? (
              <p className="mt-2 text-xs text-danger" aria-live="polite">
                {error}
              </p>
            ) : null}

            <div className="mt-3 text-xs text-muted">
              No key yet?{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline-offset-4 hover:underline"
              >
                Create one at console.anthropic.com
              </a>
              . Free trial credits work.
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-strong"
              >
                Connect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
