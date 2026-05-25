const features = [
  {
    title: "AI-generated copy",
    body: "Type one sentence about your product. WaitlistKit drafts the hero, perks, and CTA in your voice — ready to ship.",
    glyph: "✦",
  },
  {
    title: "Viral referrals built-in",
    body: "Every signup gets a referral link. Skip the queue with friends — your waitlist grows itself.",
    glyph: "◈",
  },
  {
    title: "Real-time analytics",
    body: "Track signups, top referrers, conversion rate, and source. No third-party scripts, no setup.",
    glyph: "▲",
  },
  {
    title: "Custom domains",
    body: "Point your own domain in 30 seconds. SSL, OG images, and a polished page out of the box.",
    glyph: "❋",
  },
  {
    title: "Email automation",
    body: "Welcome email on signup. Launch-day blast. Drip campaigns. All from one dashboard.",
    glyph: "✺",
  },
  {
    title: "Export anywhere",
    body: "CSV download, Webhooks, Zapier, Resend, ConvertKit. Your data stays yours.",
    glyph: "◉",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            What you get
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Everything you need to launch.
            <br />
            <span className="text-muted">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-border bg-surface/40 p-6 transition hover:border-brand/40 hover:bg-surface"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <span className="text-lg">{f.glyph}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
