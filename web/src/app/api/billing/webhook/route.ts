import Stripe from "stripe";
import { setOwnerPlan } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Stripe webhook. Wire this URL into the Stripe dashboard:
 *   https://your-domain.com/api/billing/webhook
 * and set STRIPE_WEBHOOK_SECRET in env.
 *
 * Without configured Stripe this endpoint is a no-op so health-checks pass.
 * If STRIPE_SECRET_KEY is set but the webhook secret is missing, we fail
 * closed — otherwise a misconfig would let any caller forge an upgrade.
 */
export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey && !whSecret) {
    return Response.json({ ok: true, devMode: true });
  }
  if (!whSecret) {
    console.error(
      "[wk/stripe] STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing. Webhook refusing to process.",
    );
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey ?? "");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return Response.json({ error: `Webhook verify failed: ${msg}` }, { status: 400 });
  }

  // Map our prices → plans so we can derive plan from the actual line item
  // paid, instead of trusting metadata.plan (which is owner-supplied).
  const PRICE_TO_PLAN: Record<string, "pro" | "team"> = {};
  if (process.env.STRIPE_PRICE_PRO) PRICE_TO_PLAN[process.env.STRIPE_PRICE_PRO] = "pro";
  if (process.env.STRIPE_PRICE_TEAM) PRICE_TO_PLAN[process.env.STRIPE_PRICE_TEAM] = "team";

  async function planFromSession(sessionId: string): Promise<"pro" | "team" | null> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price"],
      });
      if (session.payment_status !== "paid") return null;
      const price = session.line_items?.data[0]?.price?.id;
      if (price && PRICE_TO_PLAN[price]) return PRICE_TO_PLAN[price];
    } catch (err) {
      console.warn("[wk/stripe] session retrieve failed:", err);
    }
    return null;
  }

  async function planFromSubscription(subId: string): Promise<"pro" | "team" | null> {
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      const price = sub.items?.data[0]?.price?.id;
      if (price && PRICE_TO_PLAN[price]) return PRICE_TO_PLAN[price];
    } catch (err) {
      console.warn("[wk/stripe] subscription retrieve failed:", err);
    }
    return null;
  }

  if (event.type === "checkout.session.completed") {
    const obj = event.data.object as unknown as {
      id?: string;
      client_reference_id?: string;
      metadata?: Record<string, string>;
      customer?: string;
      subscription?: string;
    };
    const ownerId = obj.client_reference_id ?? obj.metadata?.ownerId;
    if (!ownerId || !obj.id) {
      return Response.json({ ok: true, ignored: "missing owner or session id" });
    }
    const plan = await planFromSession(obj.id);
    if (!plan) {
      return Response.json({ ok: true, ignored: "unpaid or unknown price" });
    }
    await setOwnerPlan(ownerId, plan, {
      stripeCustomerId: typeof obj.customer === "string" ? obj.customer : undefined,
      stripeSubscriptionId: typeof obj.subscription === "string" ? obj.subscription : undefined,
    });
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const obj = event.data.object as unknown as {
      id?: string;
      status?: string;
      metadata?: Record<string, string>;
      customer?: string;
    };
    const ownerId = obj.metadata?.ownerId;
    if (!ownerId || !obj.id) {
      return Response.json({ ok: true, ignored: "missing owner or sub id" });
    }
    if (obj.status !== "active" && obj.status !== "trialing") {
      return Response.json({ ok: true, ignored: `subscription status: ${obj.status}` });
    }
    const plan = await planFromSubscription(obj.id);
    if (!plan) {
      return Response.json({ ok: true, ignored: "unknown price" });
    }
    await setOwnerPlan(ownerId, plan, {
      stripeCustomerId: typeof obj.customer === "string" ? obj.customer : undefined,
      stripeSubscriptionId: obj.id,
    });
  } else if (event.type === "customer.subscription.deleted") {
    const obj = event.data.object as unknown as { metadata?: Record<string, string> };
    const ownerId = obj.metadata?.ownerId;
    if (ownerId) {
      await setOwnerPlan(ownerId, "hobby");
    }
  }

  return Response.json({ ok: true });
}
