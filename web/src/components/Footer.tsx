import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">
            Beautiful waitlists for AI startups. AI-generated copy. Viral
            referrals. Real analytics. Live in 60 seconds.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Product
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/#features" className="text-muted-strong transition hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="text-muted-strong transition hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/w/lumen-ai" className="text-muted-strong transition hover:text-foreground">
                Live demo
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-muted-strong transition hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Company
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/#faq" className="text-muted-strong transition hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <a
                href="mailto:hello@drumroll.app"
                className="text-muted-strong transition hover:text-foreground"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="https://github.com/ErnestKostevich/Project-1"
                target="_blank"
                rel="noreferrer"
                className="text-muted-strong transition hover:text-foreground"
              >
                GitHub
              </a>
            </li>
            <li>
              <Link href="/legal/privacy" className="text-muted-strong transition hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="text-muted-strong transition hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="text-muted-strong transition hover:text-foreground">
                Refund
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-muted">
          <span>© {new Date().getFullYear()} Drumroll. Built for builders.</span>
          <span className="font-mono">v0.0.1 · MVP</span>
        </div>
      </div>
    </footer>
  );
}
