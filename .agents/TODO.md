# Vidzara — Module-Level Development Todo

> Each Phase is broken into **modules**. Each module is a self-contained chunk of work.
> Mark: `[ ]` todo · `[/]` in progress · `[x]` done

---

## ✅ Phase 0 — Completed

- [x] **M0.1 — Marketing Landing Page** (Hero, Features, Pricing, Testimonials, FAQ, Workflows, Footer)
- [x] **M0.2 — Auth: Email + Password** (Better Auth, email OTP verification)
- [x] **M0.3 — Auth: Google OAuth** (Social login + account linking)
- [x] **M0.4 — Auth: Forgot / Reset Password** (OTP-based flow)
- [x] **M0.5 — Middleware** (Dashboard route protection, login redirect)
- [x] **M0.6 — Dashboard Shell** (Sidebar with 8 groups, basic layout)

---

## Phase 1 — Foundation & Dashboard Infrastructure

### M1.1 — Prisma Schema Expansion

- [x] Add `UserProfile` model (displayName, avatar, niche, youtubeChannelId, onboardingComplete, country)
- [x] Add `Subscription` model (plan enum, billingCycle, status, gateway, trialEndsAt, currentPeriodEnd)
- [x] Add `UsageRecord` model (userId, feature enum, date, count + unique constraint)
- [x] Add `Generation` model (userId, feature, input JSON, output JSON, model, tokensUsed)
- [x] Add `Coupon` model (code, discountPercent, expiresAt, maxUses, perUserLimit, country, active)
- [x] Add `Affiliate` model (userId, referralCode, commissionRate, enabled)
- [x] Add `Referral` model (affiliateId, referredUserId, convertedAt, commissionAmount, status)
- [x] Add `AbuseLog` model (userId, event enum, metadata JSON)
- [x] Add all enums: `Plan`, `BillingCycle`, `SubscriptionStatus`, `Feature`, `Gateway`, `AbuseEvent`, `ReferralStatus`
- [x] Run `pnpm prisma migrate dev` and verify

### M1.2 — Onboarding Flow

- [x] Create `/dashboard/onboarding/page.tsx`
- [x] Build multi-step wizard component (`components/dashboard/onboarding-wizard.tsx`)
  - [x] Step 1: Display name + avatar input
  - [x] Step 2: Niche selection (dropdown with search)
  - [x] Step 3: YouTube channel URL (optional, skip button)
  - [x] Step 4: Auto-assign Free plan + geo-detect trial duration
- [x] Create server action: `actions/onboarding.ts` (save profile, create subscription)
- [x] Add geo-detection utility: `lib/geo.ts` (IP → country → INR/USD)
- [x] Update middleware: check `onboardingComplete` — redirect to `/dashboard/onboarding` if false

### M1.3 — Dashboard Routing & Layout

- [x] Create shared dashboard layout: `/dashboard/layout.tsx` (sidebar + header + main area)
- [x] Update `app-sidebar.tsx` — replace all `#` links with real routes
- [x] Create placeholder pages with "Coming Soon" state for all routes:
  - [x] `/dashboard/create/video-seo/page.tsx`
  - [x] `/dashboard/create/script-writer/page.tsx`
  - [x] `/dashboard/create/thumbnail/page.tsx`
  - [x] `/dashboard/optimize/script-shortener/page.tsx`
  - [x] `/dashboard/optimize/hook-detector/page.tsx`
  - [x] `/dashboard/optimize/content-safety/page.tsx`
  - [x] `/dashboard/analyze/topic-generator/page.tsx`
  - [x] `/dashboard/analyze/outlier-detector/page.tsx`
  - [x] `/dashboard/analyze/niche-finder/page.tsx`
  - [x] `/dashboard/analyze/consistency-checker/page.tsx`
  - [x] `/dashboard/growth/page.tsx`
  - [x] `/dashboard/history/page.tsx`
  - [x] `/dashboard/billing/page.tsx`
  - [x] `/dashboard/affiliate/page.tsx`
  - [x] `/dashboard/settings/page.tsx`
- [x] Verify sidebar navigation works end-to-end

### M1.4 — Dashboard Home Page

- [x] Redesign `/dashboard/page.tsx` (replace boilerplate chart)
- [x] Welcome header with user name (from session/profile)
- [x] Usage summary cards (generations used today / daily limit)
- [x] Quick action buttons ("Write a Script", "Generate SEO", "Check Hook")
- [x] Recent generations list (last 5 from Generation table)
- [x] Plan status card (current plan + trial days remaining)
- [x] Empty state for new users (no generations yet)

### M1.5 — Settings Page

- [x] Create `/dashboard/settings/page.tsx`
- [x] Profile section: edit name, avatar, niche
- [x] Connected accounts: Google status, YouTube channel link
- [x] Theme toggle (light/dark via `next-themes`)
- [x] Danger zone: delete account (with confirmation dialog)
- [x] Server action: `actions/settings.ts`

### M1.6 — Usage Tracking System

- [x] Create `lib/usage.ts`
  - [x] `checkUsage(userId, feature)` → `{ allowed, remaining, limit }`
  - [x] `incrementUsage(userId, feature)` → void
  - [x] `getUsageSummary(userId)` → `{ [feature]: { used, limit } }`
- [x] Create `constants/limits.ts` — daily limits per plan per feature
- [x] Write unit tests for usage logic

### M1.7 — Plan Guard Utility

- [x] Create `lib/plan-guard.ts`
  - [x] `checkFeatureAccess(plan, feature, context?)` → `{ allowed, reason? }`
- [x] Create `components/dashboard/feature-gate.tsx` — UI wrapper that shows upgrade prompt
- [x] Create `types/plans.ts` — Plan enum, feature access matrix type
- [x] Create `types/features.ts` — Feature enum, feature metadata

---

## Phase 2 — AI Engine + Create & Optimize Tools

### M2.1 — AI Engine Core

- [x] Create `lib/ai/provider.ts` — AI provider abstraction (OpenAI / Gemini)
- [x] Create `lib/ai/engine.ts` — core `generateAI(feature, input, userId)` function
  - [x] Step 1: Validate session
  - [x] Step 2: Check plan access
  - [x] Step 3: Check usage quota
  - [x] Step 4: Load prompt template
  - [x] Step 5: Call AI provider
  - [x] Step 6: Increment usage
  - [x] Step 7: Save to Generation table
  - [x] Step 8: Return structured output
- [x] Create `lib/ai/types.ts` — shared AI types (AIRequest, AIResponse)
- [x] Create prompt template structure in `lib/ai/prompts/`

### M2.2 — Video SEO Generator (Feature 5.1)

- [ ] Create prompt: `lib/ai/prompts/video-seo.ts`
- [ ] Create server action: `actions/video-seo.ts`
- [ ] Create page: `/dashboard/create/video-seo/page.tsx` (replace placeholder)
- [ ] Input form: tabbed input (Topic / Key Points / Full Script)
- [ ] Output display: Titles, Description, Tags, Hashtags, Keywords
- [ ] Copy-to-clipboard button per section
- [ ] Loading state (skeleton)
- [ ] Plan gate: All plans, daily limit for Free
- [ ] Zod validation on input 

### M2.3 — Script Writer (Feature 5.2)

- [ ] Create prompt: `lib/ai/prompts/script-writer.ts`
- [ ] Create server action: `actions/script-writer.ts`
- [ ] Create page: `/dashboard/create/script-writer/page.tsx`
- [ ] Input form: Topic, Niche selector, Platform selector (YouTube/Shorts/Instagram), Video type
- [ ] Future-ready disabled UI: tone slider, length selector, language dropdown
- [ ] Output: Hook → Structured body → CTA
- [ ] Plan gate: Free = no long scripts, Limited = Shorts only, Unlimited = all
- [ ] Show upgrade prompt when Free user selects YouTube platform

### M2.4 — Hook Failure Detector (Feature 5.5)

- [ ] Create prompt: `lib/ai/prompts/hook-detector.ts`
- [ ] Create server action: `actions/hook-detector.ts`
- [ ] Create page: `/dashboard/optimize/hook-detector/page.tsx`
- [ ] Input: textarea for first 3–5 seconds / intro text
- [ ] Output: badge (❌ Weak / ⚠️ Average / ✅ Strong) + 3 improved suggestions
- [ ] Plan gate: Free = blocked, Limited = Shorts only, Unlimited = all

### M2.5 — Script Shortener (Feature 5.3)

- [ ] Create prompt: `lib/ai/prompts/script-shortener.ts`
- [ ] Create server action: `actions/script-shortener.ts`
- [ ] Create page: `/dashboard/optimize/script-shortener/page.tsx`
- [ ] Input: long script textarea + slider (1–5 outputs)
- [ ] Output: N hook-first short scripts
- [ ] Plan gate: Unlimited plan ONLY — others see upgrade prompt

### M2.6 — Content Safety Checker (Feature 5.6)

- [ ] Create prompt: `lib/ai/prompts/content-safety.ts`
- [ ] Create server action: `actions/content-safety.ts`
- [ ] Create page: `/dashboard/optimize/content-safety/page.tsx`
- [ ] Input fields: Title, Description, Tags, Script (optional, at least one required)
- [ ] Output: risk score gauge, highlighted risky phrases, policy issues, safe rewrites
- [ ] Clickbait risk + algorithm manipulation detection
- [ ] Plan gate: All plans, daily limit for Free

### M2.7 — History Page

- [ ] Create page: `/dashboard/history/page.tsx`
- [ ] Fetch all `Generation` records for current user
- [ ] Table/list view with columns: feature, input preview, date
- [ ] Filter: by feature type, date range, search query
- [ ] Click row → expand full output
- [ ] Actions: copy output, re-generate (navigate to feature with pre-filled input), delete
- [ ] Pagination
- [ ] Empty state

---

## Phase 3 — Analysis & Growth Tools

### M3.1 — Topic Generator (Feature 5.7)

- [ ] Create prompt: `lib/ai/prompts/topic-generator.ts`
- [ ] Create server action: `actions/topic-generator.ts`
- [ ] Create page: `/dashboard/analyze/topic-generator/page.tsx`
- [ ] Input: competitor channel link or name
- [ ] Output: top performing topics, title patterns, what works, 5 viral topic ideas
- [ ] Actionable: click topic → navigate to Script Writer with pre-filled topic
- [ ] Plan gate: All plans, daily limit for Free

### M3.2 — Outlier Detector (Feature 5.8)

- [ ] Create prompt: `lib/ai/prompts/outlier-detector.ts`
- [ ] Create server action: `actions/outlier-detector.ts`
- [ ] Create page: `/dashboard/analyze/outlier-detector/page.tsx`
- [ ] Input: channel link
- [ ] Output: table of outlier videos, performance delta, pattern insights
- [ ] Sortable by performance delta
- [ ] Plan gate: All plans, daily limit for Free

### M3.3 — Consistency Checker (Feature 5.9)

- [ ] Create prompt: `lib/ai/prompts/consistency-checker.ts`
- [ ] Create server action: `actions/consistency-checker.ts`
- [ ] Create page: `/dashboard/analyze/consistency-checker/page.tsx`
- [ ] Input: channel link
- [ ] Output: consistency score (visual meter), posting frequency chart, improvement plan
- [ ] Plan gate: Free = blocked, Limited = 5/day, Unlimited = unlimited

### M3.4 — Niche Finder (Feature 5.10)

- [ ] Create prompt: `lib/ai/prompts/niche-finder.ts`
- [ ] Create server action: `actions/niche-finder.ts`
- [ ] Create page: `/dashboard/analyze/niche-finder/page.tsx`
- [ ] Input: interest, skill level (Beginner/Intermediate/Advanced), content type
- [ ] Output: niche recommendation, growth potential, monetization probability, content direction
- [ ] Plan gate: Free = blocked, Limited = 5/day, Unlimited = unlimited

### M3.5 — Creator Growth Dashboard (Feature 5.11)

- [ ] Create server action: `actions/growth-dashboard.ts`
- [ ] Create page: `/dashboard/growth/page.tsx`
- [ ] Input: channel link (or auto from connected YouTube)
- [ ] Dashboard UI (not one-shot): consistency score, content type mix chart, growth direction indicator
- [ ] Continue / Stop recommendations
- [ ] Charts via `recharts`
- [ ] Plan gate: Free = basic view, Pro = full dashboard

### M3.6 — Thumbnail Concept Generator (Feature 5.4)

- [ ] Create prompt: `lib/ai/prompts/thumbnail-concept.ts`
- [ ] Create server action: `actions/thumbnail-concept.ts`
- [ ] Create page: `/dashboard/create/thumbnail/page.tsx`
- [ ] Input: topic, script excerpt, or creative intent
- [ ] Output (structured cards): thumbnail idea, text suggestion, text placement, visual focus, color/contrast guidance, emotion guidance
- [ ] Plan gate: All plans, daily limit for Free

---

## Phase 4 — Payments, Billing & Coupons

### M4.1 — Geo Detection & Pricing Config

- [ ] Create `lib/geo.ts` — IP-based country detection
- [ ] Create `constants/pricing.ts` — pricing config (INR + USD, all tiers)
- [ ] Manual currency override in settings
- [ ] Test geo detection with Indian and global IPs

### M4.2 — Stripe Integration (Global/USD)

- [ ] Install Stripe SDK
- [ ] Create `lib/payments/stripe.ts` — create checkout, manage subscription, customer portal
- [ ] Create webhook handler: `/api/webhooks/stripe/route.ts`
- [ ] Handle events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Update `Subscription` table on webhook
- [ ] Test full flow: checkout → payment → webhook → plan update

### M4.3 — Razorpay Integration (India/INR)

- [ ] Install Razorpay SDK
- [ ] Create `lib/payments/razorpay.ts` — create subscription, verify payment
- [ ] Create webhook handler: `/api/webhooks/razorpay/route.ts`
- [ ] Handle events: `subscription.activated`, `subscription.charged`, `subscription.cancelled`
- [ ] Update `Subscription` table on webhook
- [ ] Test full flow

### M4.4 — Billing Page

- [ ] Create page: `/dashboard/billing/page.tsx`
- [ ] Current plan card (name, status, renewal date)
- [ ] Usage meter (today's generations / limit)
- [ ] Plan comparison table (Free vs Limited vs Unlimited)
- [ ] Upgrade / Downgrade buttons → trigger correct gateway
- [ ] Coupon code input with real-time recalculation
- [ ] Invoice / payment history
- [ ] Cancel subscription (confirmation dialog)

### M4.5 — Coupon System

- [ ] Create `lib/coupons.ts`
  - [ ] `validateCoupon(code, userId, country)` → full validation
  - [ ] `applyCoupon(code, amount)` → discounted amount
- [ ] Server action: `actions/coupons.ts` — validate on billing page
- [ ] Real-time price recalculation in UI
- [ ] Server-side validation only (no client trust)

### M4.6 — Free Trial Logic

- [ ] Auto-create `Subscription` on signup (plan: FREE, status: TRIALING)
- [ ] Set `trialEndsAt` based on geo (India: +1 month, Global: +48 hours)
- [ ] Check-on-access: if `trialEndsAt < now` → set status EXPIRED
- [ ] Show "Trial ended" banner on all feature pages for expired users
- [ ] Upgrade CTA on trial-ended state

---

## Phase 5 — Affiliate System

### M5.1 — Affiliate Dashboard UI

- [ ] Create page: `/dashboard/affiliate/page.tsx`
- [ ] Referral link display (`vidzara.com/?ref=username`) + copy button
- [ ] Stats cards: clicks, signups, paid conversions, total earnings, pending payout
- [ ] Referral history table (who, when, converted, commission)
- [ ] Payout request button (enabled when balance ≥ threshold)

### M5.2 — Referral Tracking Backend

- [ ] Detect `?ref=` param on landing page → store in cookie (30-day expiry)
- [ ] On signup → check cookie → create `Referral` record
- [ ] On payment webhook → check if user was referred → calculate commission → credit
- [ ] Server action: `actions/affiliate.ts`

### M5.3 — Payout Flow

- [ ] Payout request action (validate threshold: ₹1000 / $20)
- [ ] Create payout request record
- [ ] Admin review in admin panel
- [ ] Mark as PAID after manual transfer

### M5.4 — Admin Affiliate Controls

- [ ] Set default commission rate
- [ ] Enable / disable individual affiliates
- [ ] Approve / reject payout requests
- [ ] View all affiliate activity logs

---

## Phase 6 — Fair Usage & Admin Panel

### M6.1 — Fair Usage / Abuse Detection

- [ ] Create `lib/abuse.ts`
  - [ ] Rate limiting (max N requests/minute per user)
  - [ ] Burst detection (>X generations in Y minutes → flag)
  - [ ] IP anomaly detection (multiple users, same IP → log)
- [ ] Log all triggers to `AbuseLog` table
- [ ] Escalation chain: Warning → Rate limit → Restrict → Suspend
- [ ] Integrate into AI engine pipeline

### M6.2 — Admin Panel: User Management

- [ ] Create `/dashboard/admin/page.tsx` (role-gated: ADMIN only)
- [ ] User search / browse table
- [ ] View user profile, plan, usage
- [ ] Manually change user plan
- [ ] Suspend / unsuspend user

### M6.3 — Admin Panel: Subscriptions

- [ ] Subscription overview table
- [ ] Manual plan assignment
- [ ] Cancel subscription on behalf of user

### M6.4 — Admin Panel: Usage Analytics

- [ ] Feature usage charts (daily, weekly trends)
- [ ] Top users by generation count
- [ ] Charts via `recharts`

### M6.5 — Admin Panel: Coupons

- [ ] Create new coupon form
- [ ] Edit existing coupons
- [ ] Disable coupons
- [ ] View usage stats per coupon

### M6.6 — Admin Panel: Abuse Logs

- [ ] View flagged events table
- [ ] Filter by event type / user / date
- [ ] Take action: warn, restrict, suspend

---

## Phase 7 — Polish, Performance & Launch

### M7.1 — Performance Optimization

- [ ] Dynamic imports for below-fold dashboard components
- [ ] Skeleton loading states for every async boundary
- [ ] Add database indexes: `UsageRecord(userId, feature, date)`, `Generation(userId, createdAt)`, `Referral(affiliateId)`
- [ ] Edge caching for marketing pages

### M7.2 — SEO & Meta

- [ ] OpenGraph images for marketing pages
- [ ] Twitter cards
- [ ] `<title>` tags on every dashboard route
- [ ] `sitemap.xml` + `robots.txt`

### M7.3 — Error Handling

- [ ] Global error boundary component
- [ ] Toast feedback on all server actions (`sonner`)
- [ ] Empty states for all list views
- [ ] Retry logic on failed AI calls

### M7.4 — Security Audit

- [ ] CSRF protection on mutations
- [ ] Rate limiting on AI + payment endpoints
- [ ] Input sanitization (Zod on every form)
- [ ] Secrets audit (no client exposure)
- [ ] Session token rotation

### M7.5 — Responsive Polish

- [ ] Dashboard sidebar → collapsible sheet on mobile
- [ ] All feature forms mobile-friendly
- [ ] Touch-friendly interactions
- [ ] Test on real devices

### M7.6 — Testing

- [ ] E2E tests: auth flow, feature generation, payment
- [ ] Unit tests: server actions, usage tracking, plan guard
- [ ] Integration tests: webhook handlers

---

## Quick Stats

| Phase                    | Modules        | Tasks          | Est. Duration    |
| ------------------------ | -------------- | -------------- | ---------------- |
| 1 — Foundation           | 7              | ~45            | 1.5–2 weeks      |
| 2 — AI + Create/Optimize | 7              | ~50            | 2–3 weeks        |
| 3 — Analyze + Growth     | 6              | ~35            | 2–3 weeks        |
| 4 — Payments & Billing   | 6              | ~30            | 1.5–2 weeks      |
| 5 — Affiliate            | 4              | ~15            | 1–1.5 weeks      |
| 6 — Fair Usage + Admin   | 6              | ~20            | 1–1.5 weeks      |
| 7 — Polish + Launch      | 6              | ~20            | 1 week           |
| **Total**                | **42 modules** | **~215 tasks** | **~10–14 weeks** |
