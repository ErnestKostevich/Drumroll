const features = [
  {
    title: "AI-generated copy",
    body: "Type one sentence about your product. Drumroll drafts the hero, perks, and CTA in your voice — ready to ship.",
    glyph: "✦",
  },
  {
    title: "Viral referrals built-in",
    body: "Every signup gets a referral link. Skip the queue with friends — your waitlist grows itself.",
    glyph: "◈",
  },
  {
    title: "Real-time analytics",
    body: "Signups, top referrers, and 14-day daily trends on every waitlist. No third-party scripts, no setup, no cookies on the visitor.",
    glyph: "▲",
  },
  {
    title: "Six theme accents",
    body: "Pick emerald, violet, amber, cyan, rose, or slate. The hero glow, CTA button, and OG share image all retint to match — no CSS needed.",
    glyph: "❋",
  },
  {
    title: "BYOK welcome email",
    body: "Bring your Resend API key. Auto-send a templated email the moment someone joins, with merge tags for position and total.",
    glyph: "✺",
  },
  {
    title: "Export + webhooks",
    body: "CSV download anytime. Per-waitlist webhook URL pings your stack on every signup (Slack, Zapier, your own API).",
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
