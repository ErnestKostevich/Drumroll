import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for using WaitlistKit.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Terms of service
      </h1>
      <p className="text-xs text-muted">Last updated: 2026-05-26.</p>

      <p>
        These are the rules for using WaitlistKit. They&apos;re written in
        plain English on purpose — read them, and if you don&apos;t agree,
        don&apos;t use the product.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Your account</h2>
      <p>
        Account = the random owner ID in your browser cookie (plus, on paid
        plans, the linked Stripe customer). Don&apos;t share that cookie with
        anyone you don&apos;t want managing your waitlists.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Acceptable use</h2>
      <p>You agree not to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Collect signups for anything illegal in your jurisdiction.</li>
        <li>Use the service to send spam, phishing, or malware.</li>
        <li>Resell access without our written permission.</li>
        <li>
          Attempt to scrape, overload, or otherwise abuse the service. Rate
          limits exist; respect them.
        </li>
        <li>Impersonate someone else&apos;s product or brand.</li>
      </ul>
      <p>
        We can suspend or delete waitlists that violate these rules, with or
        without notice. We&apos;ll try to give a heads-up when reasonable.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Bring-your-own-key AI</h2>
      <p>
        You&apos;re responsible for your own Anthropic API key, its security,
        and any usage charges from Anthropic. We just proxy the request — we
        don&apos;t see, store, or log your token spend.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Plans &amp; billing</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Hobby is free, with the limits shown on the pricing page.</li>
        <li>
          Pro and Team are subscriptions billed monthly via Stripe. Cancel
          anytime from the customer portal; access continues until the end of
          the current period.
        </li>
        <li>
          Hitting a plan limit doesn&apos;t delete data — your waitlists keep
          running, but new signups beyond the cap will be blocked until you
          upgrade.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">No warranty</h2>
      <p>
        WaitlistKit is provided &quot;as is&quot;. We do our best, but we
        can&apos;t guarantee zero downtime, zero bugs, or that the service will
        forever exist. Don&apos;t make this the only place your signups live —
        export to CSV regularly if signups matter to you.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Liability</h2>
      <p>
        Our total liability to you is capped at the amount you&apos;ve paid us
        in the last 12 months (or $50, whichever is higher). We&apos;re not
        liable for indirect damages, lost profits, or lost opportunities.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Changes</h2>
      <p>
        We may update these terms. Material changes are emailed to paying
        customers and posted here. Continued use after a change means you
        accept the new terms.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:hello@waitlistkit.com" className="text-brand underline-offset-4 hover:underline">
          hello@waitlistkit.com
        </a>
        .
      </p>
    </>
  );
}
