# AGENTS.md — Vidzara

This file defines **mandatory rules, context, constraints, and detailed feature behavior** for all AI coding agents working on the Vidzara codebase.

Agents MUST read and follow this file before making changes.

---

# 0. Source of Truth

The official product requirements are defined in:

**PROJECT BRIEF – vidzara.com** 

This AGENTS.md operationalizes that brief into enforceable engineering rules.

If there is ever a conflict:

* The Project Brief defines product intent
* This file defines engineering execution standards

---

# 1. Global Rules (Must Follow)

## Theme & Styling

* Always use `@global.css` theme variables.
* Never hardcode colors (no hex/rgb/hsl).
* Use CSS variables only.
* Respect light/dark mode via variables.
* No conditional inline color hacks.
* No ad-hoc spacing overrides.

---

## UI Components

* Always use `shadcn/ui`.
* If missing → extend shadcn properly.
* Prefer composition.
* Extend variants instead of custom styling.
* Use consistent radius: `medium`.
* Icons: `tabler` only.

---

## Package Manager

* Always use `pnpm`.
* Never use npm or yarn.

---

## UI Quality Bar

* Clean.
* Minimal.
* Strong hierarchy.
* Subtle motion.
* Clear empty states.
* Proper loading states (skeletons).
* Error states must be human-readable.

---

## Code Structure

Never:

* Write monolithic components.
* Mix business logic in UI.
* Place AI prompts inside components.

Structure:

```
/components → UI only
/features → feature modules
/lib → business logic & AI
/hooks → client hooks
/prisma → schema
/app → routes
```

---

# 2. Project Identity

**Project Name:** Vidzara
**Type:** AI SaaS
**Audience:** Global content creators
**Business Model:** Subscription-based

Vidzara is:

* Production-grade
* Revenue-driven
* Long-term SaaS
* Creator operating system

---

# 3. Core Product Principles (NON-NEGOTIABLE)

* All features visible in sidebar
* No feature hiding
* Server-side authority
* Client never trusted
* Plan logic enforced server-side
* Usage limits enforced server-side
* “Unlimited” = fair usage constrained

---

# 4. Final Technology Stack (DO NOT CHANGE)

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind
* shadcn/ui

Theme:

* Style: maia
* Base: zinc
* Accent: indigo
* Font: outfit
* Radius: medium
* Icons: tabler
* Dark mode enabled

---

## Backend

* Server Actions
* Route Handlers

No external backend service.

---

## Database

* PostgreSQL (Neon)
* Prisma ORM
* UUID primary keys
* No client DB access

---

## Auth

* Better Auth
* Session must include:

  * userId
  * plan
  * role

Forbidden:

* Clerk
* Supabase Auth
* Firebase

---

## Storage

* Supabase Storage
* Private buckets
* Signed URLs server-side

Used for:

* Exports
* Generated assets
* Admin uploads

---

## Payments

India:

* Razorpay

Global:

* Stripe

Rules:

* Monthly & Yearly only
* Webhook-driven subscription state
* Server-enforced plan update
* Location-based pricing
* Coupon support

---

# 5. Feature Surface (Detailed Functional Requirements)

All features MUST remain visible in sidebar.

---

# CREATE

---

## 5.1 Video SEO Generator

### Input

* Topic OR
* Key points OR
* Full script

### Output

* Optimized Titles (multiple)
* Description
* Tags
* Hashtags
* Keywords
* Caption
* Thumbnail ideas

### Engineering Rules

* Dedicated prompt template
* Log usage
* Track daily limit
* Save generation history

---

## 5.2 Script Writer

### Inputs

* Topic
* Niche
* Platform (YouTube / Shorts / Instagram)
* Video type

### Output

* Strong hook
* Structured flow
* CTA
* Platform-optimized tone
* Adjustable length (future-ready)
* Adjustable tone (future-ready)
* Language selection (future-ready)

### Plans

* Free: ❌ Long scripts
* Limited Pro: Shorts only
* Unlimited: All

---

## 5.3 Script Shortener

### Input

* Long script
* Select 1–5 short outputs

### Output

* Shorts-form scripts
* Hook-first structure
* Platform optimized

Unlimited plan only.

---

## 5.4 Thumbnail Concept Generator

### Input

* Topic / Script / Intent

### Output

* Thumbnail idea
* Text suggestion
* Text placement
* Visual focus
* Color & contrast guidance
* Emotion guidance

Must be structured, not vague.

---

# OPTIMIZE

---

## 5.5 Hook Failure Detector

### Input

* First 3–5 seconds or intro

### Output

* ❌ Weak
* ⚠️ Average
* ✅ Strong
* 3 improved hook suggestions

Plans:

* Free: ❌
* Limited: Shorts only
* Unlimited: All

---

## 5.6 Content Safety Checker

### Input

* Title
* Description
* Tags
* Script

### Output

* Risk score
* Highlight risky phrases
* Policy issue detection
* Safe rewrites

Must:

* Detect clickbait risk
* Detect algorithm manipulation
* Suggest optimized rewrite

---

# ANALYZE

---

## 5.7 Topic Generator (Competitor Based)

### Input

* Competitor channel link or name

### Output

* Top performing topics
* Title patterns
* What works
* 5 improved viral topic ideas

Must:

* Analyze structure patterns
* Provide actionable insight

---

## 5.8 Outlier Detector

### Input

* Channel link

### Output

* Videos performing above average
* Performance delta
* Pattern insights

---

## 5.9 Consistency Checker

### Input

* Channel link

### Output

* Consistency score
* Posting frequency
* Simple improvement plan

Limited Pro: 5/day
Unlimited: Unlimited

---

## 5.10 Niche Finder

### Input

* Interest
* Skill level
* Content type

### Output

* Beginner-friendly niche
* Growth potential
* Monetization probability
* Content direction advice

Limited: 5/day
Unlimited: Unlimited

---

# GROWTH

---

## 5.11 Creator Growth Dashboard

### Input

* Channel link

### Dashboard Must Show:

* Consistency score
* Content type mix
* Growth direction (Up / Flat / Down)
* Continue / Stop recommendations

Free:

* Basic

Pro:

* Full

---

# 6. Pricing & Plans (STRICT IMPLEMENTATION)

As defined in the official brief 

---

## Location Detection

* IP-based
* India → INR
* Global → USD
* Manual override allowed

---

## India Pricing

Free — 1 month
Limited Pro — ₹599/month
Unlimited Pro — ₹899/month
Yearly Unlimited — ₹8,999/year

---

## Global Pricing

Free — 48 hours
Limited Pro — $9/month
Unlimited Pro — $15/month
Yearly Unlimited — $149/year

---

# 7. Coupon System (Mandatory)

Must support:

* Percentage discounts
* Expiry
* Usage limits
* Per-user limits
* Country-based restriction
* Admin create/edit/disable

Rules:

* Works for INR & USD
* Real-time recalculation
* Server-side validation only

---

# 8. Affiliate System (Mandatory)

As defined in brief 

## Core Logic

* Unique referral link:
  `vidzara.com/?ref=username`
* Commission ONLY on paid subscription
* No commission on signup

---

## Admin Controls

* Set commission rate
* Enable/disable affiliates
* Approve/reject earnings
* Manage payout status

---

## Payout Rules

* Minimum threshold

  * ₹1000
  * $20
* Manual payout initially
* Payout request flow

---

# 9. Fair Usage Policy

* Unlimited ≠ abuse
* Bot usage forbidden
* Excess automation forbidden
* Abuse detection triggers:

  * Rate limiting
  * Restriction
  * Suspension

Must log:

* Generation frequency
* IP anomalies
* Burst usage patterns

---

# 10. Middleware & Security

* Protect `/dashboard/*`
* Validate session server-side
* Validate plan server-side
* Validate usage server-side
* Never trust client flags

---

# 11. Explicitly Forbidden

Agents MUST NOT:

* Introduce Firebase
* Introduce Clerk
* Introduce Supabase Auth
* Change stack
* Add UI frameworks
* Store secrets client-side
* Hardcode AI prompts in UI
* Bypass Prisma

---

# 12. Agent Behavior Rules

Agents SHOULD:

* Preserve architecture
* Maintain clean folder structure
* Avoid premature abstraction
* Optimize for SaaS scale
* Prioritize maintainability
* Ask before structural changes

---

# 13. Engineering Standard

All contributions must reflect:

* Stability
* Scalability
* Security
* Business readiness
* Professional SaaS standards

---

# END OF AGENTS.md