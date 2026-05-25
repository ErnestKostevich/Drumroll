import Anthropic from "@anthropic-ai/sdk";
import { sanitizeCopy, type CopyOutput } from "@/lib/copy-gen";
import { ipFrom, limit } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
  const ip = ipFrom(req.headers);
  const gate = limit(`ai:${ip}`, 30, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.json(
      { error: "AI generation rate limit reached (30/hour per IP). Try again later." },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil((gate.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const apiKey = req.headers.get("x-anthropic-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return Response.json(
      { error: "Provide a valid Anthropic API key in the x-anthropic-key header." },
      { status: 401 },
    );
  }

  let payload: { productName?: string; description?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productName = String(payload.productName ?? "").trim();
  const description = String(payload.description ?? "").trim();
  if (productName.length < 2 || description.length < 10) {
    return Response.json(
      { error: "Both productName (≥2 chars) and description (≥10 chars) are required." },
      { status: 400 },
    );
  }

  let copy: CopyOutput | null = null;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Product name: ${productName}\nDescription: ${description}\n\nReturn the JSON now.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      copy = sanitizeCopy(extractJson(textBlock.text));
    }
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err !== null && "status" in err && typeof (err as { status: unknown }).status === "number"
        ? (err as { status: number }).status
        : 502;
    const message =
      typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Anthropic call failed";

    return Response.json(
      {
        error:
          status === 401
            ? "Anthropic rejected the key. Check it at console.anthropic.com."
            : status === 429
              ? "Rate limited by Anthropic. Try again in a moment."
              : message,
      },
      { status: status === 401 ? 401 : 502 },
    );
  }

  if (!copy) {
    return Response.json(
      { error: "AI returned malformed output. Try regenerating, or submit without AI." },
      { status: 502 },
    );
  }

  return Response.json({ copy });
}
