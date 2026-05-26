import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "How refunds work at WaitlistKit.",
};

export default function RefundPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Refund policy
      </h1>
      <p className="text-xs text-muted">Last updated: 2026-05-26.</p>

      <h2 className="text-xl font-semibold text-foreground">30-day guarantee</h2>
      <p>
        Within 30 days of your first Pro or Team payment, email{" "}
        <a href="mailto:hello@waitlistkit.com" className="text-brand underline-offset-4 hover:underline">
          hello@waitlistkit.com
        </a>{" "}
        and we&apos;ll refund you in full, no questions asked. We&apos;d rather
        give you your money back than have an unhappy customer.
      </p>

      <h2 className="text-xl font-semibold text-foreground">After 30 days</h2>
      <p>
        Subscriptions are non-refundable after the 30-day window, but you can
        cancel any time and you won&apos;t be billed again. Your waitlists keep
        working through the end of the current billing period.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Exceptions</h2>
      <p>
        We won&apos;t refund accounts that have violated the{" "}
        <a href="/legal/terms" className="text-brand underline-offset-4 hover:underline">
          terms
        </a>{" "}
        (spam, abuse, etc.) — those get terminated without refund.
      </p>

      <h2 className="text-xl font-semibold text-foreground">How to request</h2>
      <p>
        Send an email from the address on your Stripe receipt to{" "}
        <a href="mailto:hello@waitlistkit.com" className="text-brand underline-offset-4 hover:underline">
          hello@waitlistkit.com
        </a>{" "}
        with the subject &quot;refund&quot;. We process within 3 business days
        and Stripe takes another 5–10 days to land the funds back on your card.
      </p>
    </>
  );
}
