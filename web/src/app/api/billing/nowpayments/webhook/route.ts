import { setOwnerPlan } from "@/lib/auth";
import {
  isPaymentSuccessful,
  PLAN_PRICE_USD,
  verifyIpnSignature,
} from "@/lib/nowpayments";

export const runtime = "nodejs";

/**
 * NOWPayments IPN endpoint. Wire this URL in your NOWPayments dashboard
 * (Store Settings → Webhook URL):
 *   https://your-domain.com/api/billing/nowpayments/webhook
 *
 * Required env: NOWPAYMENTS_IPN_SECRET (must match the secret shown in the
 * NOWPayments dashboard when you created the IPN secret key).
 *
 * If NOWPAYMENTS_API_KEY is configured but the IPN secret is not, this
 * endpoint fails closed (500) — a misconfigured IPN secret would otherwise
 * let an attacker forge upgrades for any owner.
 */
export async function POST(req: Request) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  // Fully unconfigured (no checkout side either) → dev mode no-op.
  if (!apiKey && !ipnSecret) {
    return Response.json({ ok: true, devMode: true, message: "NOWPayments not configured." });
  }

  // API key set but IPN secret missing → misconfiguration, fail closed.
  if (!ipnSecret) {
    console.error(
      "[wk/nowpayments] NOWPAYMENTS_API_KEY is set but NOWPAYMENTS_IPN_SECRET is missing. Webhook refusing to process anything until the secret is set.",
    );
    return Response.json(
      { error: "IPN secret not configured. Webhook disabled." },
      { status: 500 },
    );
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
    pay_amount?: number;
    actually_paid?: number;
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

  // Verify the actual price paid matches the plan price. NOWPayments converts
  // crypto→USD on their side, so `price_amount` is what the invoice asked for.
  // `actually_paid` (in crypto units) being less than expected would mark
  // status as `partially_paid` which already short-circuits above, but check
  // price_amount as defence-in-depth against a fake/replayed IPN with a low
  // amount sneaking through.
  const expectedUsd = PLAN_PRICE_USD[plan];
  const paidUsd = Number(event.price_amount);
  const currency = String(event.price_currency ?? "").toLowerCase();
  if (currency !== "usd" || !Number.isFinite(paidUsd) || paidUsd + 0.01 < expectedUsd) {
    console.warn(
      `[wk/nowpayments] amount/currency mismatch for ${event.order_id}: got ${paidUsd} ${currency}, expected ${expectedUsd} usd`,
    );
    return Response.json(
      { ok: true, ignored: "price mismatch", got: paidUsd, expected: expectedUsd },
    );
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
