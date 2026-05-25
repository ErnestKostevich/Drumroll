"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "waitlistkit:anthropic_key";

/**
 * Client-side hook for the user's Anthropic API key. Stored in localStorage,
 * never sent to our backend except per-request as the `x-anthropic-key` header
 * when the user explicitly triggers AI generation.
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setApiKeyState(stored);
    } catch {
      // localStorage may be blocked (private mode, embed)
    }
    setLoaded(true);
  }, []);

  function setApiKey(v: string | null) {
    try {
      if (v) {
        window.localStorage.setItem(STORAGE_KEY, v);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    setApiKeyState(v);
  }

  return { apiKey, setApiKey, loaded };
}

export function maskKey(key: string): string {
  if (key.length < 16) return "•".repeat(key.length);
  return `${key.slice(0, 10)}…${key.slice(-4)}`;
}
