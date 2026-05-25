import Stripe from "stripe";
import { getOrCreateOwner, setOwnerPlan } from "@/lib/auth";

export const runtime = "nodejs";

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

type CheckoutBody = { plan?: "pro" | "team" };

export async function POST(req: Request) {
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
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = PRICE_BY_PLAN[plan];

  // Dev / unconfigured mode: flip the cookie owner's plan locally and return.
  // Useful for local demos and for shipping the product before Stripe is wired.
  if (!stripeKey || !priceId) {
    await setOwnerPlan(owner.id, plan);
    return Response.json({
      ok: true,
      devMode: true,
      message: `Upgraded to ${plan} (dev mode — Stripe not configured).`,
    });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const url = new URL(req.url);
    const origin = url.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
      client_reference_id: owner.id,
      metadata: { ownerId: owner.id, plan },
      ...(owner.stripeCustomerId ? { customer: owner.stripeCustomerId } : {}),
    });

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stripe call failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
