# Drumroll

> Beautiful waitlists for AI startups. Bring-your-own-key AI. Viral referrals. Real analytics. Live in 60 seconds.

A purpose-built waitlist product for AI startup founders, built on a **zero-cost-to-operator** model: users bring their own Anthropic key, you (the operator) pay nothing per generation, all infra runs on free tiers up to thousands of users.

**Live demo:** run locally and visit `/w/lumen-ai`
**Status:** v0.3 — public beta. BYOK live, deployable to Vercel + Turso for $0.
**Dev by:** Ernest Kostevich

---

## What it does

- **Bring-your-own-key AI copy** — paste your Anthropic key once (stored in localStorage), get tagline + perks + CTAs in your product's voice. Without a key, a clean template generator kicks in — the waitlist still ships.
- **Viral referral loops** — every signup gets a personal share link. Friends joining bumps them up the queue.
- **Conversion-tuned templates** — dark UI built for 2026 launches, mobile-first, fast.
- **Dynamic OG images** — every waitlist gets its own auto-rendered share preview.
- **Real analytics** — signups, top referrers, conversion rate. No third-party scripts.
- **Owner dashboard** — manage all your waitlists in one place.

## Why zero-cost for the operator

| Component | Free tier | Cost per user to operator |
|-----------|-----------|---------------------------|
| Vercel hosting | 100GB bandwidth + 100GB-hr compute | $0 (room for ~1M page views) |
| Turso libSQL | 500MB + 1B reads/mo | $0 |
| Claude API | n/a — **users pay Anthropic directly** | **$0** |
| Email (future) | Resend / SendGrid free tier | $0 until ~3k emails/mo |
| Total fixed cost | | **$0/mo** |

Customers pay $19-49/mo for the hosting platform, branding, custom domain, referral mechanics, and dashboard. AI tokens are passed through directly to Anthropic — no markup, no caps.

## Pricing (target)

| Plan | Price | What you get |
|------|-------|--------------|
| Hobby | $0 | 1 waitlist, 500 signups, template copy, Drumroll subdomain |
| Pro | $19 / mo | Unlimited waitlists, 25k signups, custom domain, BYOK AI |
| Team | $49 / mo | Pro + 250k signups, 5 seats, white-label, API access |

AI generation = users bring their own Anthropic key, pay Anthropic directly (~$0.005-0.01 per waitlist).

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
6. Visit `/dashboard` → see **your** waitlists (scoped by the `wk_owner` cookie set on creation)
7. Click **Edit** to refine copy, set a webhook URL, or change the accent glyph
8. Click **Export signups (CSV)** in the danger zone to download a CSV
9. Hit the Hobby limit on a 2nd waitlist → see the upgrade card → click **Upgrade to Pro** → dev-mode flips your plan immediately

### How AI copy works (BYOK)

1. Open the create form, click **"✨ Connect key"** in the top-right of the form.
2. Paste an Anthropic key from [console.anthropic.com](https://console.anthropic.com/settings/keys). It's stored only in your browser's localStorage.
3. Click **"✨ Generate with AI"**. The browser POSTs to `/api/ai/generate` with your key in an `x-anthropic-key` header. The route proxies to Anthropic, returns JSON copy, and never logs the key.
4. Preview appears in-form. Click **Launch** to create the waitlist with that copy.

You can also self-host with a server-side key for personal use: set `ANTHROPIC_API_KEY` in `.env.local` and modify `/api/ai/generate/route.ts` to fall back to it (a few lines).

## What's still stubbed

| Stub | Real implementation |
|------|---------------------|
| ~~In-memory store~~ ✅ **libSQL + Drizzle** | Add Turso for prod (1 env var) |
| ~~Template copy only~~ ✅ **BYOK Claude API + template fallback** | – |
| ~~Mock dashboard / shared with anyone~~ ✅ **Cookie-scoped ownership** | Upgrade to magic-link auth if you want multi-device |
| ~~No plan limits~~ ✅ **Hobby: 1 wl / 500 signups · Pro: 50 / 25k · Team: 200 / 250k** | – |
| ~~No billing flow~~ ✅ **Stripe Checkout scaffold + webhook handler + dev-mode self-upgrade** | Set `STRIPE_SECRET_KEY` + price IDs |
| ~~No edit/delete~~ ✅ **/dashboard/[slug]/edit + Danger zone delete + CSV export** | – |
| ~~No rate limiting~~ ✅ **IP-based: 30 AI/hr, 10 creates/hr, 60 joins/min/slug** | Upstash Redis if you scale past one Vercel region |
| ~~No webhooks~~ ✅ **Per-waitlist webhook URL fired on signup** | – |
| ~~No legal pages~~ ✅ **Privacy + Terms + Refund** at `/legal/*` | Tweak text for your jurisdiction before launch |
| ~~No SEO basics~~ ✅ **robots.txt + sitemap.xml + per-route metadata** | – |
| ~~No embed widget~~ ✅ **Drop-in `<script>` snippet on the edit page** + `/embed.js` runtime + CORS-enabled `/api/embed/signup` | – |
| ~~No referral leaderboard~~ ✅ **Top 3 referrers shown on every waitlist page** | – |
| ~~No cookie notice~~ ✅ **Minimal in-app banner (no third-party tracker disclosure needed)** | – |
| ~~No error boundary~~ ✅ **Global `app/error.tsx` with retry + back-home** | – |
| No email | Resend (welcome email + launch blast) |
| No magic-link auth | Cookie ownership is fine for first 100 customers |

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
