import "server-only";

export type CopyInput = {
  productName: string;
  description: string;
};

export type CopyOutput = {
  tagline: string;
  longDescription: string;
  ctaLabel: string;
  accentEmoji: string;
  perks: string[];
};

export const ALLOWED_EMOJIS = ["✦", "◆", "▲", "❋", "✺", "◈", "◉", "❖"];

const CTA_LABELS = [
  "Get early access",
  "Claim your spot",
  "Join the waitlist",
  "Reserve your seat",
  "Be first in line",
];

const PERK_TEMPLATES = [
  "Lifetime 30% off for the first 500 users",
  "Skip the line by referring {n} friends",
  "Direct access to the founders on Slack",
  "Early API credits worth $100",
  "Founding-member badge on your profile",
  "Free onboarding call with the team",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Deterministic, no-cost copy generation. Always works — used by default,
 * and as the fallback when a BYOK AI call fails or no key is provided.
 */
export function generateCopy({ productName, description }: CopyInput): CopyOutput {
  const seed = hash(productName + description);
  const tagline =
    description.length > 80
      ? description.slice(0, 77).trim() + "…"
      : description;
  return {
    tagline,
    longDescription: `${productName} is launching soon. ${description} Join the waitlist to be among the first to try it — and earn rewards by inviting friends.`,
    ctaLabel: pick(CTA_LABELS, seed),
    accentEmoji: pick(ALLOWED_EMOJIS, seed),
    perks: [
      PERK_TEMPLATES[0],
      PERK_TEMPLATES[1].replace("{n}", "3"),
      pick(PERK_TEMPLATES.slice(2), seed),
    ],
  };
}

/**
 * Sanitize copy from any source (AI or user-supplied) so it's safe to store.
 */
export function sanitizeCopy(raw: unknown): CopyOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.tagline !== "string" ||
    typeof o.longDescription !== "string" ||
    typeof o.ctaLabel !== "string" ||
    typeof o.accentEmoji !== "string" ||
    !Array.isArray(o.perks) ||
    o.perks.some((p) => typeof p !== "string")
  ) {
    return null;
  }
  const perks = (o.perks as string[]).slice(0, 3).map((p) => p.slice(0, 80).trim());
  if (perks.length < 1) return null;
  return {
    tagline: o.tagline.slice(0, 120).trim(),
    longDescription: o.longDescription.slice(0, 320).trim(),
    ctaLabel: o.ctaLabel.slice(0, 32).trim(),
    accentEmoji: ALLOWED_EMOJIS.includes(o.accentEmoji) ? o.accentEmoji : ALLOWED_EMOJIS[0],
    perks,
  };
}
