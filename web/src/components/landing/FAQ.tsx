const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "Nope. You type a product name and one sentence. Drumroll generates the page and the referral mechanics for you.",
  },
  {
    q: "Why do I bring my own Anthropic API key?",
    a: "Two reasons. (1) Your token cost goes straight to Anthropic — typically less than a cent per waitlist — instead of us marking it up 5x like most AI products. (2) Your usage stays in your control: pause it, swap models, switch providers later, no lock-in. The key lives only in your browser; we proxy each call without ever logging it.",
  },
  {
    q: "Can I use it without an API key?",
    a: "Yes. Without a key, copy comes from a clean template generator — still hosts a beautiful waitlist, just without the AI polish. Add a key anytime to upgrade existing waitlists.",
  },
  {
    q: "Can I use a custom domain?",
    a: "Not yet — every waitlist lives at drumroll.app/w/[slug] for now. Custom domains per waitlist are on the roadmap once we hear from enough paying customers asking for it. Your OG image and shareable URL still look clean today.",
  },
  {
    q: "How is this different from Tally / waitlist.email / getwaitlist?",
    a: "Those are generic form builders. Drumroll is purpose-built for AI startups — built-in viral referrals, AI-drafted copy in your product's voice, and conversion-tuned page templates that actually look like a 2026 launch.",
  },
  {
    q: "Where is my data stored?",
    a: "Turso (managed libSQL) in production, or local SQLite if you self-host. You can export to CSV any time, and Pro+ plans have webhooks + direct integrations with Resend, ConvertKit, and Loops.",
  },
  {
    q: "How do I pay?",
    a: "Crypto only — Bitcoin, Ethereum, USDT and 300+ other coins via NOWPayments. Sub-1% transaction fees mean more money to the founder, less to payment processors. No cards, no LLC required, no PayPal-style chargebacks.",
  },
  {
    q: "Is there a refund?",
    a: "30-day no-questions-asked refund on Pro and Team. We don't want unhappy customers.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b border-border/60 py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Questions, answered.
          </h2>
          <p className="mt-6 text-muted-strong">
            Still stuck?{" "}
            <a
              href="mailto:ernest2011kostevich@gmail.com"
              className="text-brand underline-offset-4 hover:underline"
            >
              Email us
            </a>{" "}
            and we&apos;ll get back today.
          </p>
        </div>
        <ul className="space-y-3">
          {faqs.map((f) => (
            <li
              key={f.q}
              className="rounded-xl border border-border bg-surface/40 p-6 transition hover:border-brand/30"
            >
              <p className="font-medium text-foreground">{f.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">
                {f.a}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
