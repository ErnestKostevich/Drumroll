import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const NP_API = "https://api.nowpayments.io/v1";

export type CreateInvoiceInput = {
  priceAmount: number;
  priceCurrency: string;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateInvoiceResult =
  | { ok: true; id: string; invoiceUrl: string }
  | { ok: false; error: string };

/**
 * Create a hosted invoice. Customer is redirected to invoice_url where they
 * pick crypto + pay. We get an IPN webhook on confirmation.
 */
export async function createInvoice(
  apiKey: string,
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  try {
    const res = await fetch(`${NP_API}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        price_amount: input.priceAmount,
        price_currency: input.priceCurrency,
        order_id: input.orderId,
        order_description: input.orderDescription,
        ipn_callback_url: input.ipnCallbackUrl,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      invoice_url?: string;
      message?: string;
      code?: string;
    };

    if (!res.ok || !data.invoice_url || !data.id) {
      return {
        ok: false,
        error: data.message ?? data.code ?? `NOWPayments HTTP ${res.status}`,
      };
    }

    return { ok: true, id: data.id, invoiceUrl: data.invoice_url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "NOWPayments network error",
    };
  }
}

/**
 * Sort object keys recursively so the signature matches NOWPayments' format.
 * They sign the JSON of the sorted-key payload.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Verify the IPN signature using HMAC-SHA512 with the IPN secret over the
 * JSON-stringified payload with alphabetically sorted keys.
 */
export function verifyIpnSignature(
  rawBody: string,
  signatureHex: string,
  ipnSecret: string,
): boolean {
  try {
    const payload = JSON.parse(rawBody);
    const canonical = JSON.stringify(sortKeysDeep(payload));
    const expected = createHmac("sha512", ipnSecret).update(canonical).digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signatureHex, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Payment statuses NOWPayments emits. We treat finished/confirmed as success.
 * See https://documenter.getpostman.com/view/7907941/S1a32n38
 */
export type NpPaymentStatus =
  | "waiting"
  | "confirming"
  | "confirmed"
  | "sending"
  | "partially_paid"
  | "finished"
  | "failed"
  | "refunded"
  | "expired";

export function isPaymentSuccessful(status: string): status is "finished" | "confirmed" {
  return status === "finished" || status === "confirmed";
}

export const PLAN_PRICE_USD: Record<"pro" | "team", number> = {
  pro: 19,
  team: 49,
};
