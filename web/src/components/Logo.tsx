import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground"
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand text-brand-ink shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_8px_30px_-12px_rgba(52,211,153,0.6)]">
        <span className="text-[13px] font-bold leading-none">W</span>
        <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10 transition group-hover:ring-white/20" />
      </span>
      <span>
        Waitlist<span className="text-brand">Kit</span>
      </span>
    </Link>
  );
}
