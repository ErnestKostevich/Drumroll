import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground"
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand text-brand-ink shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-brand)_40%,transparent),0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand)_60%,transparent)]">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="3" rx="1.5" fill="currentColor" />
          <rect
            x="3"
            y="10.5"
            width="14"
            height="3"
            rx="1.5"
            fill="currentColor"
            opacity="0.55"
          />
          <rect
            x="3"
            y="17"
            width="10"
            height="3"
            rx="1.5"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
        <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10 transition group-hover:ring-white/20" />
      </span>
      <span>
        Waitlist<span className="text-brand">Kit</span>
      </span>
    </Link>
  );
}
