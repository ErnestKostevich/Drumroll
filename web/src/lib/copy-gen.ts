import "server-only";
import Anthropic from "@anthropic-ai/sdk";

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

const SYSTEM_PROMPT = `You are a world-class growth marketer who writes high-converting waitlist landing pages for AI startups in 2026.

You receive a product name and a one-sentence description. Return ONE JSON object — no markdown, no commentary, just JSON — with exactly these fields:

{
  "tagline": "5-12 word hook, no trailing punctuation",
  "longDescription": "2 sentences (30-50 words) that explain what's special and end with a sentence that nudges signup",
  "ctaLabel": "3-5 word CTA button text",
  "accentEmoji": "ONE glyph from this set: ✦ ◆ ▲ ❋ ✺ ◈ ◉ ❖",
  "perks": ["3 short benefit strings", "max 10 words each", "what waitlist signups actually get"]
}

Voice rules:
- Confident, modern, founder-speak. Sound like Linear or Vercel, not enterprise SaaS.
- No "revolutionary", "game-changing", "powered by AI" — those words are banned.
- Don't repeat the product name in the tagline.
- Perks should be specific (numbers, percentages, named benefits) — not generic ("be the first to know").

Output JSON only.`;

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

function templateGenerate({ productName, description }: Input): Output {
  const seed = hash(productName + description);
  const tagline =
    description.length > 80
      ? description.slice(0, 77).trim() + "…"
      : description;
  return {
    tagline,
    longDescription: `${productName} is launching soon. ${description} Join the waitlist to be among the first to try it — and earn rewards by inviting friends.`,
    ctaLabel: pick(CTA_LABELS, seed),
    accentEmoji: pick(EMOJIS, seed),
    perks: [
      PERK_TEMPLATES[0],
      PERK_TEMPLATES[1].replace("{n}", "3"),
      pick(PERK_TEMPLATES.slice(2), seed),
    ],
  };
}

function sanitize(raw: unknown): Output | null {
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
  const perks = (o.perks as string[]).slice(0, 3);
  if (perks.length < 1) return null;
  return {
    tagline: o.tagline.slice(0, 120).trim(),
    longDescription: o.longDescription.slice(0, 320).trim(),
    ctaLabel: o.ctaLabel.slice(0, 32).trim(),
    accentEmoji: EMOJIS.includes(o.accentEmoji) ? o.accentEmoji : EMOJIS[0],
    perks: perks.map((p) => p.slice(0, 80).trim()),
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

async function llmGenerate(input: Input): Promise<Output | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Product name: ${input.productName}\nDescription: ${input.description}\n\nReturn the JSON now.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;
    const parsed = extractJson(textBlock.text);
    return sanitize(parsed);
  } catch (err) {
    console.error("[copy-gen] LLM call failed, falling back to template:", err);
    return null;
  }
}

/**
 * Generate waitlist landing copy.
 * Uses Claude when ANTHROPIC_API_KEY is set; otherwise falls back to a
 * deterministic template so the product still works end-to-end.
 */
export async function generateCopy(input: Input): Promise<Output> {
  const fromLlm = await llmGenerate(input);
  return fromLlm ?? templateGenerate(input);
}
