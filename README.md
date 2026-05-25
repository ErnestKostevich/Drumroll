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

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack)
- **React 19** with `useActionState` for forms
- **Tailwind CSS v4** (theme via `@theme inline` in `globals.css`)
- **TypeScript** (strict mode)
- **libSQL + Drizzle ORM** — local file-based SQLite for dev, Turso for prod (same code, just env vars)
- **Anthropic Claude** for AI copy generation (optional — falls back to template if `ANTHROPIC_API_KEY` not set)
- **next/og** for dynamic per-waitlist Open Graph images

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

Visit `http://localhost:3000`. The first request creates a local SQLite file at `web/local.db` and seeds the `Lumen AI` demo waitlist.

Try the flow:
1. Land on `/` — see the marketing page
2. Type a product name + sentence in the hero form → submit
3. Get redirected to `/w/[your-slug]?owner=1` — the owner sees a banner with the shareable URL
4. Open the same URL in incognito → that's what visitors see
5. Submit an email → see your position + referral link
6. Visit `/dashboard` → see all your waitlists with signup counts

### Optional: real AI copy

```bash
# in web/.env.local
ANTHROPIC_API_KEY=sk-ant-...
```

With a key set, `createWaitlist` calls Claude (Sonnet 4.6 by default) to generate the tagline, perks, and CTA. Without it, the deterministic template kicks in — the rest of the flow is identical.

## What's still stubbed

| Stub | Real implementation |
|------|---------------------|
| ~~In-memory store~~ ✅ **libSQL + Drizzle** | Add Turso for prod (1 env var) |
| ~~Template copy~~ ✅ **Claude API (with fallback)** | – |
| No auth | Clerk, Lucia, or magic-link via Resend |
| No billing | Stripe Checkout + Customer Portal |
| No email | Resend (welcome email + launch blast) |
| Mock owner dashboard stats | Real aggregations from DB |
| Anyone can see any waitlist on /dashboard | Wire to authed user once auth lands |

## Deploy to Vercel

The fastest path. SQLite-on-disk doesn't work in serverless, so we use [Turso](https://turso.tech) (managed libSQL) for prod — same Drizzle code, just env vars.

```bash
# 1. Create a free Turso DB (one-time)
brew install tursodatabase/tap/turso   # or see https://docs.turso.tech/cli/installation
turso auth signup
turso db create waitlistkit
turso db show waitlistkit --url        # → libsql://waitlistkit-you.turso.io
turso db tokens create waitlistkit     # → eyJh...

# 2. Push the schema once
cd web
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=eyJh... npm run db:push

# 3. Deploy
npx vercel

# 4. In Vercel project settings → Environment Variables, add:
#    DATABASE_URL=libsql://waitlistkit-you.turso.io
#    DATABASE_AUTH_TOKEN=eyJh...
#    ANTHROPIC_API_KEY=sk-ant-...   (optional)
```

For self-host on any Node 20+ box: `npm run build && npm start`. The local SQLite file works there too.

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
