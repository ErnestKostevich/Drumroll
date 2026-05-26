# Drumroll 🥁

> **Drumroll your launch.** Beautiful waitlist pages for AI startups. Bring-your-own-key AI. Crypto checkout. Viral referrals. Live in 60 seconds.

A purpose-built waitlist product for AI startup founders, built on a **zero-cost-to-operator** model: users bring their own Anthropic key for AI copy, customers pay you in crypto, and every piece of infra runs on free tiers up to thousands of users.

| | |
|--|--|
| **Live** | https://waitlistkit-three.vercel.app *(custom domain coming when drumroll.app is purchased)* |
| **Demo waitlist** | https://waitlistkit-three.vercel.app/w/lumen-ai |
| **Status** | v0.0.1 — shipped, payment loop live, taking real signups |
| **Built by** | Ernest Kostevich |
| **Contact** | ernest2011kostevich@gmail.com |

---

## What users get

- **🥁 BYOK AI copy** — paste an Anthropic key once (stored in their browser localStorage), get a tagline, perks, CTA, and accent glyph in their product's voice. Without a key, a clean template generator kicks in — the waitlist still ships.
- **🥁 Viral referral loops** — every signup gets a personal share link. Friends joining bumps them up the queue. Top 3 referrers shown on the public page.
- **🥁 Conversion-tuned templates** — dark UI built for 2026 launches, mobile-first, six accent colors (emerald · violet · amber · cyan · rose · slate).
- **🥁 Dynamic OG images** — every waitlist gets an auto-rendered 1200×630 share preview that retints to match the chosen accent color.
- **🥁 Embed widget** — drop two tags on any site and the waitlist signup form renders inline. CORS-enabled, no CSS or framework required on the host.
- **🥁 Welcome emails (BYOK Resend)** — auto-send a templated email on signup with `{{position}}`, `{{total}}`, `{{product}}` merge tags. Resend API key encrypted at rest with AES-256-GCM.
- **🥁 Webhooks** — per-waitlist URL pings the founder's stack on every signup (Slack, Zapier, custom API). Source-tagged (site/embed).
- **🥁 Owner dashboard** — cookie-scoped (no account, no password) with 14-day signup sparklines, today/7-day stats, and per-waitlist edit/delete + CSV export.

## How the operator (you) makes money

| Component | Free tier | What you pay |
|-----------|-----------|--------------|
| Vercel hosting | 100GB bandwidth + 100GB-hr compute | $0 (room for ~1M page views) |
| Turso libSQL | 500MB + 1B reads + 25M writes / mo | $0 |
| Anthropic API | n/a — **users pay Anthropic directly via BYOK** | **$0** |
| Resend email | n/a — **users pay Resend directly via BYOK** | **$0** |
| NOWPayments crypto checkout | n/a — **~0.5% fee deducted from the customer's payment** | **$0 fixed** |
| **Total fixed cost** | | **$0 / month** |

Customers pay $19/mo (Pro) or $49/mo (Team) in crypto. You net **~$18.90 / $48.75** per subscription after the NOWPayments fee.

## Pricing

| Plan | Price | What you get |
|------|-------|--------------|
| **Hobby** | $0 | 1 waitlist · 500 signups · template copy · Drumroll subdomain · viral referrals · CSV export |
| **Pro** | $19 / mo | Unlimited waitlists · 25k signups each · AI copy (BYOK Anthropic) · welcome emails (BYOK Resend) · webhooks · CSV export |
| **Team** | $49 / mo | Everything in Pro · 250k signups per waitlist · dedicated email channel · custom integrations on request |

No token markup. Customers bring their own AI / email keys, pay providers directly.

## How users use it (5-step flow)

1. **Open the site** → see the marketing landing, click "Launch a waitlist".
2. **Type product name + one sentence** describing it. Optionally click "✨ Generate with AI" to get AI-drafted tagline + perks + CTA (BYOK Anthropic).
3. **Click Launch** → redirected to `/w/[slug]?owner=1` with a share banner. Share that URL anywhere.
4. **Visitors join** by entering email. They see `You're #N of M` plus a personal referral link. Their referrals count is incremented when someone uses their link.
5. **Manage** at `/dashboard` — see signup sparklines, edit copy/theme, set up a webhook, configure welcome emails, export CSV. Upgrade to Pro (crypto checkout) when you hit Hobby limits.

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack) + **React 19** (`useActionState` for forms)
- **Tailwind CSS v4** (CSS-variable themes via `@theme inline`)
- **TypeScript** (strict)
- **libSQL + Drizzle ORM** — local file-based SQLite for dev (`file:./local.db`), Turso for prod (same code, two env vars)
- **Anthropic Claude** for AI copy (optional, BYOK — proxied through `/api/ai/generate`, key never logged or stored)
- **Resend** for welcome emails (optional, BYOK — owner key encrypted AES-256-GCM at rest)
- **NOWPayments** for crypto checkout — accepts BTC, ETH, USDT and 300+ coins, no LLC required, ~0.5% fees
- **next/og** for dynamic per-waitlist Open Graph images

## Repo layout

```
.
├── README.md                      # you are here
├── .gitignore
├── .claude/                       # local Claude Code launch config
└── web/                           # Next.js app
    ├── package.json               # drumroll@0.0.1
    ├── drizzle.config.ts
    ├── .env.example               # all env vars documented
    └── src/
        ├── app/
        │   ├── page.tsx                       # marketing landing
        │   ├── dashboard/page.tsx             # owner dashboard
        │   ├── dashboard/[slug]/edit/         # editor (copy, theme, email, webhook)
        │   ├── dashboard/settings/            # owner-level Resend key, default From
        │   ├── w/[slug]/page.tsx              # public waitlist page (the thing customers share)
        │   ├── w/[slug]/opengraph-image.tsx   # per-waitlist OG (themed)
        │   ├── legal/{privacy,terms,refund}/  # legal pages
        │   ├── api/ai/generate/               # BYOK Anthropic proxy
        │   ├── api/billing/checkout/          # checkout entry — NOWPayments or dev-mode self-upgrade
        │   ├── api/billing/nowpayments/       # NOWPayments checkout + IPN webhook
        │   ├── api/embed/signup/              # CORS-enabled embed signup endpoint
        │   ├── api/waitlist/[slug]/signups.csv  # owner-only CSV export
        │   ├── embed.js/                      # public drop-in JS widget
        │   ├── robots.ts · sitemap.ts         # SEO
        │   ├── icon.tsx · opengraph-image.tsx # favicon + landing OG
        │   ├── error.tsx · not-found.tsx      # global error boundary + 404
        │   └── actions.ts                     # server actions
        ├── components/
        │   ├── landing/                       # Hero, Features, Steps, Pricing, FAQ, FinalCta
        │   ├── CreateWaitlistForm.tsx · ConnectAiModal.tsx
        │   ├── Header.tsx · Footer.tsx · Logo.tsx
        │   ├── CookieNotice.tsx · SignupSparkline.tsx
        └── lib/
            ├── db/schema.ts · db/client.ts    # Drizzle schema + libSQL client + idempotent migrations
            ├── store.ts                       # all data access
            ├── auth.ts                        # cookie ownership + effectivePlan helper
            ├── crypto.ts                      # AES-256-GCM for owner Resend keys
            ├── csrf.ts                        # Sec-Fetch-Site check for mutating Route Handlers
            ├── rate-limit.ts                  # IP-based sliding window
            ├── url-validate.ts                # SSRF protection for user webhook URLs
            ├── email.ts                       # Resend send + plain-text → HTML wrap
            ├── nowpayments.ts                 # invoice creation + IPN signature verify (HMAC-SHA512)
            ├── copy-gen.ts                    # template fallback copy generator
            └── slug.ts                        # URL-safe slug helpers
```

## Run locally

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`. First request creates `web/local.db` and seeds the Lumen AI demo. Build needs `NODE_OPTIONS=--max-old-space-size=4096` on Windows if you hit OOM.

## Deploy to production

Tested path: Vercel + Turso + NOWPayments.

### 1. Create a free Turso DB

Either via web UI at https://turso.tech (sign in with GitHub, click "Create Database") or CLI:

```bash
turso auth signup
turso db create drumroll
turso db show drumroll --url           # → libsql://drumroll-you.turso.io
turso db tokens create drumroll        # → eyJh...
```

### 2. Set up NOWPayments (for crypto checkout)

Sign up at https://account.nowpayments.io → **Store Settings**:
- Copy the **API key**
- Generate an **IPN Secret Key** (save it — only shown once)
- Set **Webhook URL** to `https://<your-domain>/api/billing/nowpayments/webhook`
- **Settings → Payout wallets** → add at least one (e.g. USDT TRC20) — otherwise invoices won't create

### 3. Generate the encryption secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the 64-char hex string — this is `WAITLISTKIT_SECRET`. It encrypts users' stored Resend keys; if you lose it after launch, all stored keys become unrecoverable.

### 4. Deploy via Vercel CLI

```bash
cd web
npx vercel login --github          # browser opens, click Authorize
npx vercel link --yes              # creates the project
npx vercel deploy --prod
```

### 5. Set env vars

In Vercel dashboard → Project → Settings → Environment Variables (or via `vercel env add`):

| Name | Required | Value |
|------|----------|-------|
| `DATABASE_URL` | ✅ | `libsql://drumroll-you.turso.io` |
| `DATABASE_AUTH_TOKEN` | ✅ | `eyJh...` (from Turso) |
| `WAITLISTKIT_SECRET` | ✅ | 32+ byte hex string |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://your-canonical-domain.com` (used by robots.txt/sitemap.xml/embed.js — without it they point to the per-deploy URL) |
| `NOWPAYMENTS_API_KEY` | for real payments | from NOWPayments dashboard → Settings → API Keys |
| `NOWPAYMENTS_IPN_SECRET` | for real payments | from NOWPayments dashboard → Settings → Instant payment notifications |

Then `npx vercel deploy --prod` again to pick them up.

### 6. (Optional) Custom domain

Vercel dashboard → Project → Domains → add `drumroll.app` (or whatever you bought) → follow the DNS instructions → done in ~10 minutes. Update `NEXT_PUBLIC_SITE_URL` to match.

## Security posture

- **CSRF** — `/api/billing/checkout` and `/api/billing/nowpayments/checkout` reject cross-site requests via `Sec-Fetch-Site` header.
- **SSRF** — user-supplied webhook URLs validated against private IP ranges (RFC1918, 169.254/16 AWS IMDS, IPv6 loopback/link-local) before any outbound `fetch`.
- **Secret encryption** — owner Resend keys stored AES-256-GCM with master key from `WAITLISTKIT_SECRET`; production fails closed if missing.
- **Webhook signature verification** — NOWPayments IPN verified via HMAC-SHA512 over alphabetically-sorted JSON.
- **Price verification** — both webhooks re-derive plan from actual paid amount / price ID, not from owner-controllable metadata.
- **Rate limits** — in-memory sliding-window per IP: 30/hr AI proxy, 10/hr create + checkout, 60/min joins per slug.
- **Cookie ownership** — `wk_owner` cookie is httpOnly + SameSite=Lax; secure in production. ID is `crypto.randomUUID()` (no `Math.random` fallback).
- **CORS** — only `/api/embed/signup` is open; everything else is same-origin only.
- **No third-party tracking** — single first-party cookie, no analytics scripts, no advertising pixels.

## What's still on the roadmap (not shipped yet)

| Feature | Triggered by |
|---------|--------------|
| Magic-link auth (multi-device dashboard) | First customer complaint about losing access on a different browser |
| Custom domain per waitlist (`wait.theirstart.com` via Host-header routing) | 3+ customers asking |
| Email drip campaigns (reminder, launch-day blast) | After product-market fit |
| API tokens for programmatic create/list/export | Team-tier customer asks |
| White-label embed (no "Powered by Drumroll" footer) | Team-tier customer asks |
| Conversion-rate analytics (page views → signups) | Need Plausible / Vercel Analytics |

Each of these is straightforward (1–6 hours of work each) but intentionally deferred to avoid speculative feature-building.

## Distribution plan

1. **Twitter/X** — short Loom of the 60-second create flow, tagged `#buildinpublic` `#indiehackers`
2. **r/SaaS · r/IndieHackers · r/SideProject** — repurpose the Loom
3. **Hacker News** — Show HN once we have a custom domain and ≥10 paying customers (stronger signal)
4. **Cold DMs** — find AI-startup founders on X who recently launched on `waitlist.email` or `tally.so`; offer a free migration
5. **Product Hunt** — wait until 100+ paying customers for a stronger PH launch

## License

Proprietary. All rights reserved. May open-source the page templates separately later.

---

Built with [Claude Code](https://claude.com/claude-code). The git log tells the whole story — every commit is a real step from empty repo to live production SaaS, written in plain English.
