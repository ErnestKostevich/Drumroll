import Stripe from "stripe";
import { getOrCreateOwner, setOwnerPlan } from "@/lib/auth";
import { createInvoice, PLAN_PRICE_USD } from "@/lib/nowpayments";
import { ipFrom, limit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/csrf";

export const runtime = "nodejs";

const STRIPE_PRICE_BY_PLAN: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

type CheckoutBody = { plan?: "pro" | "team" };

/**
 * Unified checkout endpoint. Delegates by env config (priority order):
 *   1. NOWPAYMENTS_API_KEY → crypto checkout via NOWPayments hosted invoice
 *   2. STRIPE_SECRET_KEY + STRIPE_PRICE_<PLAN> → card checkout via Stripe
 *   3. Neither → dev-mode self-upgrade (30 days)
 *
 * NOWPayments is preferred when both are set because it works from anywhere
 * (no LLC required) and has lower fees.
 */
export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return Response.json({ error: "Cross-site requests not allowed." }, { status: 403 });
  }

  const ip = ipFrom(req.headers);
  const gate = limit(`checkout:${ip}`, 10, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.json(
      { error: "Too many checkout attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan;
  if (plan !== "pro" && plan !== "team") {
    return Response.json({ error: "Plan must be 'pro' or 'team'." }, { status: 400 });
  }

  const owner = await getOrCreateOwner();
  const nowKey = process.env.NOWPAYMENTS_API_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripePrice = STRIPE_PRICE_BY_PLAN[plan];
  const url = new URL(req.url);
  const origin = url.origin;

  // --- NOWPayments (crypto) ---
  if (nowKey) {
    const orderId = `${owner.id}|${plan}|${Date.now()}`;
    const result = await createInvoice(nowKey, {
      priceAmount: PLAN_PRICE_USD[plan],
      priceCurrency: "usd",
      orderId,
      orderDescription: `WaitlistKit ${plan === "pro" ? "Pro" : "Team"} — 1 month`,
      ipnCallbackUrl: `${origin}/api/billing/nowpayments/webhook`,
      successUrl: `${origin}/dashboard?upgraded=1`,
      cancelUrl: `${origin}/dashboard?upgrade=cancelled`,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ url: result.invoiceUrl, provider: "nowpayments" });
  }

  // --- Stripe (cards) ---
  if (stripeKey && stripePrice) {
    try {
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: stripePrice, quantity: 1 }],
        success_url: `${origin}/dashboard?upgraded=1`,
        cancel_url: `${origin}/dashboard?upgrade=cancelled`,
        client_reference_id: owner.id,
        metadata: { ownerId: owner.id, plan },
        ...(owner.stripeCustomerId ? { customer: owner.stripeCustomerId } : {}),
      });
      return Response.json({ url: session.url, provider: "stripe" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Stripe call failed";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  // --- Dev mode: flip plan locally for 30 days ---
  const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  await setOwnerPlan(owner.id, plan, { planRenewsAt: renewsAt });
  return Response.json({
    ok: true,
    devMode: true,
    provider: "dev",
    message: `Upgraded to ${plan} for 30 days (dev mode — no billing provider configured).`,
  });
}
