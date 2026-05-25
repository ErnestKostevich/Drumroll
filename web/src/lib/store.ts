import "server-only";

export type Waitlist = {
  slug: string;
  productName: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  accentEmoji: string;
  perks: string[];
  createdAt: number;
};

export type Signup = {
  email: string;
  joinedAt: number;
  referredBy: string | null;
  referrals: number;
};

type Store = {
  waitlists: Map<string, Waitlist>;
  signups: Map<string, Signup[]>;
};

const globalForStore = globalThis as unknown as { __waitlistkitStore?: Store };

export const store: Store =
  globalForStore.__waitlistkitStore ??
  (globalForStore.__waitlistkitStore = {
    waitlists: new Map(),
    signups: new Map(),
  });

export function getWaitlist(slug: string): Waitlist | undefined {
  return store.waitlists.get(slug);
}

export function listSignups(slug: string): Signup[] {
  return store.signups.get(slug) ?? [];
}

export function totalSignups(slug: string): number {
  return listSignups(slug).length;
}

export function positionFor(slug: string, email: string): number | null {
  const list = listSignups(slug);
  const idx = list.findIndex((s) => s.email === email);
  if (idx === -1) return null;
  return idx + 1;
}

export function ensureDemoSeed(): void {
  if (store.waitlists.size > 0) return;
  const demo: Waitlist = {
    slug: "lumen-ai",
    productName: "Lumen AI",
    tagline: "The AI co-pilot that actually understands your codebase.",
    description:
      "Lumen reads your entire repo, learns your conventions, and writes PRs that pass review on the first try. Join the waitlist for early access.",
    ctaLabel: "Get early access",
    accentEmoji: "✦",
    perks: [
      "Skip the queue with 1 referral",
      "Lifetime 30% off for the first 500 users",
      "Direct Slack channel with the founders",
    ],
    createdAt: Date.now(),
  };
  store.waitlists.set(demo.slug, demo);
  store.signups.set(demo.slug, [
    {
      email: "founder@vercel.com",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      referredBy: null,
      referrals: 4,
    },
    {
      email: "sarah@linear.app",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      referredBy: null,
      referrals: 2,
    },
    {
      email: "tom@notion.so",
      joinedAt: Date.now() - 1000 * 60 * 60 * 24,
      referredBy: null,
      referrals: 1,
    },
  ]);
}
