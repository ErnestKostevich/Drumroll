const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "Nope. You type a product name and one sentence. WaitlistKit generates the page, the copy, the OG image, and the referral mechanics for you.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes — Pro and Team plans support custom domains. Add a CNAME and we handle SSL automatically. The page lives on your domain, not ours.",
  },
  {
    q: "How is this different from Tally / waitlist.email / getwaitlist?",
    a: "Those are generic form builders. WaitlistKit is purpose-built for AI startups — built-in viral referrals, AI-drafted copy in your product's voice, and conversion-tuned page templates that actually look like a 2026 launch.",
  },
  {
    q: "Where is my data stored?",
    a: "Postgres on Supabase. You can export to CSV any time, and Pro+ plans have webhooks + direct integrations with Resend, ConvertKit, and Loops.",
  },
  {
    q: "Can I bring my own LLM API key?",
    a: "Yes. Hobby plan uses our shared model with rate limits. Pro+ lets you wire in your own Claude / OpenAI key for unlimited generations and lower latency.",
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
              href="mailto:hello@waitlistkit.com"
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
