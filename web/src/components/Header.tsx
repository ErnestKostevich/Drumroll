import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/#features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#faq" className="transition hover:text-foreground">
            FAQ
          </Link>
          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm text-muted transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/#create"
            className="inline-flex h-9 items-center justify-center rounded-full bg-brand px-4 text-sm font-medium text-[#04140d] transition hover:bg-brand-strong"
          >
            Launch a waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
