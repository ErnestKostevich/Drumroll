import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How WaitlistKit handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Privacy
      </h1>
      <p className="text-xs text-muted">Last updated: 2026-05-26.</p>

      <p>
        Short version: we store the minimum needed to run your waitlist, we
        don&apos;t sell anything to anyone, and AI calls go directly between
        your browser and Anthropic when you bring your own key.
      </p>

      <h2 className="text-xl font-semibold text-foreground">What we store</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          A random owner ID in a first-party cookie (<code className="font-mono text-xs">wk_owner</code>) so we can show you only your waitlists.
        </li>
        <li>
          For each waitlist you create: the product name, tagline, perks, CTA
          text, accent glyph, optional webhook URL, and the time it was
          created.
        </li>
        <li>
          For each signup on your waitlists: the email address, signup time,
          and (if applicable) which referral link they used. Stored in libSQL
          (managed by Turso when self-hosted on Vercel, otherwise local SQLite).
        </li>
        <li>
          Standard server logs (IP, user agent, response status) retained for
          up to 30 days, used only for abuse detection.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">
        What we don&apos;t store
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Your Anthropic API key.</strong> It lives only in your
          browser&apos;s localStorage. Each AI call passes the key in a
          request header to <code className="font-mono text-xs">/api/ai/generate</code>, which forwards
          it straight to Anthropic and never logs or persists it.
        </li>
        <li>Passwords (we don&apos;t have accounts yet — cookie ownership only).</li>
        <li>Third-party analytics or advertising trackers.</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">Third parties</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Anthropic</strong> — AI calls if you opt into BYOK copy generation.</li>
        <li><strong>Turso</strong> — managed libSQL database hosting (if deployed to prod).</li>
        <li><strong>Vercel</strong> — application hosting, edge network.</li>
        <li><strong>Stripe</strong> — payment processing (only if you upgrade to a paid plan).</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
      <p>
        You can export your signups as CSV at any time from the dashboard&apos;s
        edit page. You can delete a waitlist (and all its signups) from the
        same place. To delete your owner account entirely, email{" "}
        <a href="mailto:hello@waitlistkit.com" className="text-brand underline-offset-4 hover:underline">
          hello@waitlistkit.com
        </a>{" "}
        from any address — we&apos;ll purge within 7 days.
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
