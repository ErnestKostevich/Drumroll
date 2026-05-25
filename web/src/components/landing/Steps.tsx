const steps = [
  {
    n: "01",
    title: "Describe your product",
    body: "Name + one sentence. That's it. No copywriting, no design, no Figma.",
  },
  {
    n: "02",
    title: "AI drafts everything",
    body: "Headline, perks, CTAs, OG image, even the founder bio. Edit in two clicks if you want.",
  },
  {
    n: "03",
    title: "Share & watch it grow",
    body: "Send the link to X / Reddit / friends. The referral loop does the rest.",
  },
];

export function Steps() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            From idea to launch in 60 seconds.
          </h2>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="bg-surface/60 p-8">
              <p className="font-mono text-sm text-brand">{s.n}</p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-strong">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
