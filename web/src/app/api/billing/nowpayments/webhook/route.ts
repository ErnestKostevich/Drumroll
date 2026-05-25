import { setOwnerPlan } from "@/lib/auth";
import { isPaymentSuccessful, verifyIpnSignature } from "@/lib/nowpayments";

export const runtime = "nodejs";

/**
 * NOWPayments IPN endpoint. Wire this URL in your NOWPayments dashboard
 * (Store Settings → IPN callback URL):
 *   https://your-domain.com/api/billing/nowpayments/webhook
 *
 * Set NOWPAYMENTS_IPN_SECRET in env to verify HMAC signatures. Without
 * the secret this endpoint returns 200 dev-mode (does NOT update the plan).
 */
export async function POST(req: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    return Response.json({ ok: true, devMode: true, message: "IPN_SECRET not set; ignored." });
  }

  const sig = req.headers.get("x-nowpayments-sig");
  if (!sig) {
    return Response.json({ error: "Missing x-nowpayments-sig header" }, { status: 400 });
  }

  const rawBody = await req.text();
  if (!verifyIpnSignature(rawBody, sig, ipnSecret)) {
    return Response.json({ error: "Bad signature" }, { status: 400 });
  }

  let event: {
    payment_id?: string | number;
    payment_status?: string;
    order_id?: string;
    price_amount?: number;
    price_currency?: string;
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }

  if (!event.payment_status || !event.order_id) {
    return Response.json({ ok: true, ignored: "missing fields" });
  }

  if (!isPaymentSuccessful(event.payment_status)) {
    return Response.json({ ok: true, status: event.payment_status });
  }

  const parts = event.order_id.split("|");
  const ownerId = parts[0];
  const planRaw = parts[1];
  const plan: "pro" | "team" | null =
    planRaw === "pro" || planRaw === "team" ? planRaw : null;

  if (!ownerId || !plan) {
    return Response.json({ ok: true, ignored: "unparseable order_id" });
  }

  const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  await setOwnerPlan(ownerId, plan, {
    planRenewsAt: renewsAt,
    stripeSubscriptionId:
      typeof event.payment_id === "string"
        ? event.payment_id
        : event.payment_id !== undefined
          ? String(event.payment_id)
          : undefined,
  });

  return Response.json({ ok: true, ownerId, plan, renewsAt });
}
