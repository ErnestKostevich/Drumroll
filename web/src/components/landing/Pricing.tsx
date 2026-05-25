import Link from "next/link";

const plans = [
  {
    name: "Hobby",
    price: "$0",
    cadence: "forever",
    tagline: "Test the waters.",
    cta: "Start free",
    href: "/#create",
    highlight: false,
    features: [
      "1 waitlist",
      "Up to 500 signups",
      "Template-generated copy",
      "WaitlistKit subdomain",
      "Viral referrals built-in",
      "CSV export",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    tagline: "For serious launches.",
    cta: "Start 14-day free trial",
    href: "/#create",
    highlight: true,
    features: [
      "Unlimited waitlists",
      "Up to 25,000 signups",
      "Custom domain + your branding",
      "AI copy (bring your own Anthropic key)",
      "Webhooks + email integrations",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/ month",
    tagline: "Built for AI startups with traction.",
    cta: "Talk to us",
    href: "mailto:hello@waitlistkit.com",
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 250,000 signups",
      "5 team members",
      "White-label embeds",
      "API access",
      "Custom SLA + dedicated Slack",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Honest pricing. No token caps.
          </h2>
          <p className="mt-4 text-muted-strong">
            We don&apos;t markup AI tokens. Bring your own Anthropic key and pay
            them direct — your AI cost stays predictable, ours stays at zero,
            and you stay in control.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "relative rounded-2xl border border-brand/50 bg-gradient-to-b from-brand-soft to-transparent p-8 glow-brand"
                  : "relative rounded-2xl border border-border bg-surface/40 p-8"
              }
            >
              {p.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#04140d]">
                  Most popular
                </span>
              ) : null}
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold text-foreground">
                  {p.name}
                </h3>
                <p className="text-sm text-muted">{p.tagline}</p>
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-5xl font-semibold tracking-tight">
                  {p.price}
                </span>
                <span className="text-sm text-muted">{p.cadence}</span>
              </div>
              <Link
                href={p.href}
                className={
                  p.highlight
                    ? "mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
                    : "mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-border-strong bg-surface text-sm font-medium text-foreground transition hover:border-brand/50"
                }
              >
                {p.cta}
              </Link>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-muted-strong"
                  >
                    <span className="mt-[3px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-soft text-[10px] text-brand">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
          Plans launch with public-beta pricing. Lifetime discount for the first
          500 paying customers. AI generation typically costs &lt;$0.01 per
          waitlist on Anthropic&apos;s side.
        </p>
      </div>
    </section>
  );
}
