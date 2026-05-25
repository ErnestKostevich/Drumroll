import "server-only";

type Input = {
  productName: string;
  description: string;
};

type Output = {
  tagline: string;
  longDescription: string;
  ctaLabel: string;
  accentEmoji: string;
  perks: string[];
};

const EMOJIS = ["✦", "◆", "▲", "❋", "✺", "◈", "◉", "❖"];

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
 * MVP: deterministic, template-based "AI" copy. Swap with a real LLM call
 * (Claude / GPT) once the BYOK or hosted billing flow is wired up.
 */
export function generateCopy({ productName, description }: Input): Output {
  const seed = hash(productName + description);
  const tagline = description.length > 80
    ? description.slice(0, 77).trim() + "…"
    : description;

  const longDescription = `${productName} is launching soon. ${description} Join the waitlist to be among the first to try it — and earn rewards by inviting friends.`;

  const perks = [
    PERK_TEMPLATES[0],
    PERK_TEMPLATES[1].replace("{n}", "3"),
    pick(PERK_TEMPLATES.slice(2), seed),
  ];

  return {
    tagline,
    longDescription,
    ctaLabel: pick(CTA_LABELS, seed),
    accentEmoji: pick(EMOJIS, seed),
    perks,
  };
}
