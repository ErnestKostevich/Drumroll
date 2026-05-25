import Link from "next/link";

export function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-br from-brand-soft via-transparent to-accent/10 p-10 text-center shadow-2xl shadow-black/40 md:p-14">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              Ship it today
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Your waitlist could be live
              <br />
              <span className="text-gradient">in 60 seconds.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-muted-strong">
              No credit card. No demo call. Just a beautiful waitlist that
              converts, ready to share.
            </p>
            <Link
              href="/#create"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-[#04140d] transition hover:bg-brand-strong"
            >
              Launch your waitlist →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
