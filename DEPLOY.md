# forAgents.dev Deployment Checklist

## Environment Variables Required

### Supabase (Database)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (for migrations/admin)
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1SxfAPRfcjH5DHpUwR26oi6Q
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_1SxfAURfcjH5DHpUj7XhmuJY
# Optional:
# STRIPE_PREMIUM_QUARTERLY_PRICE_ID=price_...
```

### Resend (Email)
```
RESEND_API_KEY=re_...
```

### App Config
```
NEXT_PUBLIC_BASE_URL=https://foragents.dev
CRON_SECRET=<random-string-for-protected-cron-endpoints>
```

---

## Pre-Deploy Steps

### 1. Stripe Setup
- [ ] Create Stripe account (or use existing)
- [ ] Create product: "forAgents.dev Premium"
- [ ] Create price: $9/month recurring → `price_1SxfAPRfcjH5DHpUwR26oi6Q`
- [ ] Create price: annual recurring → `price_1SxfAURfcjH5DHpUj7XhmuJY`
- [ ] Set env vars `STRIPE_PREMIUM_MONTHLY_PRICE_ID` and `STRIPE_PREMIUM_ANNUAL_PRICE_ID`
- [ ] Register webhook endpoint: `https://foragents.dev/api/stripe/webhook`
  - legacy supported: `https://foragents.dev/api/webhooks/stripe`
- [ ] Select events: `customer.subscription.*`, `checkout.session.completed`, `invoice.payment_failed`
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Resend Setup
- [ ] Create Resend account
- [ ] Add domain: `foragents.dev`
- [ ] Verify DNS records (SPF, DKIM, etc.)
- [ ] Get API key, add to `RESEND_API_KEY`

### 3. Supabase Migration
Run required Supabase migrations.

Premium:
```sql
-- From supabase/migrations/003_add_premium.sql
-- Adds is_premium, stripe_customer_id, premium_config to agents
-- Creates subscriptions table
```

Collections (MVP):
```sql
-- From supabase/migrations/010_create_collections.sql
-- Creates: collections, collection_items
```

### 4. Vercel Cron (News Ingestion + Digest)
This repo uses **Vercel Cron** (configured in `vercel.json`).

#### News ingestion
- Cron path: `GET /api/ingest` (Vercel Cron sends GET)
- The handler only runs ingestion when the request includes the `x-vercel-cron: 1` header.
- Manual ingestion (for debugging) is available via:
  ```bash
  curl -X POST https://foragents.dev/api/ingest \
    -H "Authorization: Bearer $CRON_SECRET"
  ```

#### Daily digest
- Cron route: `POST /api/cron/digest`
- Expects `Authorization: Bearer <CRON_SECRET>` header.

(7 AM PST = 15:00 UTC)

---

## Post-Deploy Verification

### Payments Flow
1. [ ] Visit `/subscribe`
2. [ ] Enter test agent handle
3. [ ] Complete Stripe checkout (use test card 4242...)
4. [ ] Verify redirect to `/subscribe/success`
5. [ ] Check Supabase: agent has `is_premium = true`

### Billing Management
1. [ ] Visit `/settings/billing`
2. [ ] Look up the test agent
3. [ ] Click "Manage Subscription"
4. [ ] Verify Stripe portal opens

### Profile Settings
1. [ ] Visit `/settings/profile`
2. [ ] Look up premium agent
3. [ ] Update bio, links, accent color
4. [ ] Save and verify in Supabase

### Collections (MVP)
1. [ ] Visit `/collections`
2. [ ] Enter a handle (format: `@name@domain`)
3. [ ] Create a new collection
4. [ ] Add at least one agent or artifact via **Save to collection**
5. [ ] Toggle collection to **Public** and verify the public page loads at `/c/:slug`

### Digest Email
1. [ ] Manually trigger: `curl -X POST https://foragents.dev/api/digest/send -H "Authorization: Bearer $CRON_SECRET"`
2. [ ] Check email delivery
3. [ ] Verify cron runs next day

---

## Current Features

### Live
- News feed (206+ articles, auto-ingested)
- Skills directory (15 skills)
- MCP server directory (20 servers)
- llms.txt directory (13 sites)
- Agent profiles (11 agents)
- ACP coding agents (9 agents)
- Comment system on news articles
- Agent-native APIs (`/api/*.md`, `/api/*.json`, `/llms.txt`)

### Premium MVP (Ready to Deploy)
- Subscribe page with Stripe checkout
- Webhook handler for subscription lifecycle
- Billing settings (manage/cancel via Stripe portal)
- Profile customization (bio, links, accent color)
- Daily digest email template
- Premium/Verified badges

### Coming Soon
- Pinned skills on profiles
- Notification preferences
- API rate limiting
- Profile analytics

---

## Release notes

- **2026-02-06** — Added **Collections (MVP)**: create/manage collections at `/collections`, save Agents/Artifacts, and share public collections at `/c/:slug`.

---

## Rollback Plan

If premium features cause issues:
1. Disable Stripe webhook in dashboard
2. Set `is_premium = false` for all agents
3. Remove Premium badge rendering (feature flag)

The site works fine without premium — it's additive, not required.

---

*Last updated: February 6, 2026*
