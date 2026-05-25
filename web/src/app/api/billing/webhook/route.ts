import Stripe from "stripe";
import { setOwnerPlan } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Stripe webhook. Wire this URL into the Stripe dashboard:
 *   https://your-domain.com/api/billing/webhook
 * and set STRIPE_WEBHOOK_SECRET in env.
 *
 * Without a configured Stripe (dev mode), this endpoint is a no-op and
 * returns 200 so health-checks pass.
 */
export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !whSecret) {
    return Response.json({ ok: true, devMode: true });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return Response.json({ error: `Webhook verify failed: ${msg}` }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const obj = event.data.object as unknown as {
      client_reference_id?: string;
      metadata?: Record<string, string>;
      customer?: string;
      subscription?: string;
      id?: string;
    };
    const ownerId = obj.client_reference_id ?? obj.metadata?.ownerId;
    const plan = (obj.metadata?.plan as "pro" | "team" | undefined) ?? "pro";
    if (ownerId) {
      await setOwnerPlan(ownerId, plan, {
        stripeCustomerId:
          typeof obj.customer === "string" ? obj.customer : undefined,
        stripeSubscriptionId:
          typeof obj.subscription === "string"
            ? obj.subscription
            : event.type !== "checkout.session.completed"
              ? obj.id
              : undefined,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const obj = event.data.object as unknown as { metadata?: Record<string, string> };
    const ownerId = obj.metadata?.ownerId;
    if (ownerId) {
      await setOwnerPlan(ownerId, "hobby");
    }
  }

  return Response.json({ ok: true });
}
