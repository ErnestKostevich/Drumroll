import { getOrCreateOwner, setOwnerPlan } from "@/lib/auth";
import { createInvoice, PLAN_PRICE_USD } from "@/lib/nowpayments";
import { ipFrom, limit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/csrf";

export const runtime = "nodejs";

type CheckoutBody = { plan?: "pro" | "team" };

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

  // Same email gate as /api/billing/checkout — without it, a direct POST
  // here bypasses the "Pro is tied to your inbox" guarantee.
  if (!owner.email || !owner.emailVerifiedAt) {
    return Response.json(
      {
        error: "verify_email",
        message:
          "Verify your email before upgrading. Your Pro subscription should be tied to your inbox so it can't be lost if you clear cookies or change browsers.",
        verifyUrl: "/dashboard/settings",
      },
      { status: 403 },
    );
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    // Dev mode: extend the cookie owner's plan for 30 days locally.
    const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await setOwnerPlan(owner.id, plan, { planRenewsAt: renewsAt });
    return Response.json({
      ok: true,
      devMode: true,
      message: `Upgraded to ${plan} until ${new Date(renewsAt).toISOString()} (dev mode — NOWPayments not configured).`,
    });
  }

  const url = new URL(req.url);
  const origin = url.origin;

  // order_id encodes ownerId, plan, timestamp so the IPN webhook can parse
  // it back without storing a separate mapping table.
  const orderId = `${owner.id}|${plan}|${Date.now()}`;

  const result = await createInvoice(apiKey, {
    priceAmount: PLAN_PRICE_USD[plan],
    priceCurrency: "usd",
    orderId,
    orderDescription: `Drumroll ${plan === "pro" ? "Pro" : "Team"} — 1 month`,
    ipnCallbackUrl: `${origin}/api/billing/nowpayments/webhook`,
    successUrl: `${origin}/dashboard?upgraded=1`,
    cancelUrl: `${origin}/dashboard?upgrade=cancelled`,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json({ url: result.invoiceUrl, id: result.id });
}
