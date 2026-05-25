# WaitlistKit

> Beautiful waitlists for AI startups. AI-generated copy. Viral referrals. Real analytics. Live in 60 seconds.

A purpose-built waitlist product for AI startup founders. Stop losing signups to ugly waitlist pages from 2018.

**Live demo:** run locally and visit `/w/lumen-ai`
**Status:** v0.1 — public beta. MVP scaffolding shipped.
**Dev by:** Ernest Kostevich

---

## What it does

- **AI-generated landing copy** — type a product name and one sentence, get a full waitlist page with hero, CTA, perks, and OG image.
- **Viral referral loops** — every signup gets a personal share link. Friends joining bumps them up the queue.
- **Conversion-tuned templates** — dark UI built for 2026 launches, mobile-first, fast.
- **Real analytics** — signups, top referrers, conversion rate. No third-party scripts.
- **Owner dashboard** — manage all your waitlists in one place.

## Pricing (target)

| Plan | Price | What you get |
|------|-------|--------------|
| Hobby | $0 | 1 waitlist, 500 signups, WaitlistKit branding |
| Pro | $29 / mo | Unlimited waitlists, 25k signups, custom domain, AI copy |
| Team | $99 / mo | Pro + 250k signups, 5 seats, white-label, API access |

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions)
- **React 19** with `useActionState` for forms
- **Tailwind CSS v4** (theme via `@theme inline` in `globals.css`)
- **TypeScript** (strict mode)
- **In-memory store** for MVP — swap to Supabase Postgres before production launch

## Repo layout

```
.
├── README.md            # you are here
├── .gitignore           # workspace-level ignores
└── web/                 # Next.js app — the product
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # marketing landing
    │   │   ├── dashboard/page.tsx  # owner dashboard
    │   │   ├── w/[slug]/page.tsx   # public waitlist page (the thing customers share)
    │   │   ├── actions.ts          # server actions (createWaitlist, joinWaitlist)
    │   │   ├── layout.tsx
    │   │   └── globals.css         # design tokens
    │   ├── components/
    │   │   ├── landing/            # Hero, Features, Pricing, FAQ, Steps, FinalCta
    │   │   ├── CreateWaitlistForm.tsx
    │   │   ├── Header.tsx · Footer.tsx · Logo.tsx
    │   └── lib/
    │       ├── store.ts            # in-memory store (replace with DB)
    │       ├── copy-gen.ts         # template-based copy (replace with Claude API)
    │       └── slug.ts
    └── package.json
```

## Run locally

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`.

Try the flow:
1. Land on `/` — see the marketing page
2. Type a product name + sentence in the hero form → submit
3. Get redirected to `/w/[your-slug]?owner=1` — the owner sees a banner with the shareable URL
4. Open the same URL in incognito → that's what visitors see
5. Submit an email → see your position + referral link
6. Visit `/dashboard` → see all your waitlists with signup counts

## What's stubbed (for MVP)

These are intentionally minimal so the loop is demonstrable end-to-end. Wire up real implementations when ready to charge money:

| Stub | Real implementation |
|------|---------------------|
| In-memory `lib/store.ts` | Supabase Postgres + Drizzle/Prisma |
| Template `lib/copy-gen.ts` | Claude API (`claude-sonnet-4-6` is the right cost/quality default) |
| No auth | Clerk or Supabase Auth |
| No billing | Stripe Checkout + Customer Portal |
| No email | Resend (welcome email + launch blast) |
| Mock owner dashboard stats | Real aggregations from DB |

## Deploy

The fastest path is Vercel (zero-config Next.js):

```bash
cd web
npx vercel
```

For self-host, any Node 18+ host works (`npm run build && npm start`).

## Distribution plan (when MVP is ready to ship)

1. **Twitter/X** — post a 15-sec Loom of the create flow tagged `#buildinpublic`
2. **Hacker News** — Show HN once a real DB + auth lands
3. **r/SaaS, r/IndieHackers, r/SideProject** — repurpose the Loom
4. **AI Twitter cold DMs** — find founders who just launched bad waitlists, offer a free migration
5. **Product Hunt** — wait until 100+ paying users for a stronger launch signal

## License

Proprietary. All rights reserved (for now — may open-source later).

---

Built with [Claude Code](https://claude.com/claude-code).
