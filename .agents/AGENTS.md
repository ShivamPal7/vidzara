# AGENTS.md — Vidzara

This file defines **mandatory rules, context, and constraints** for all AI coding agents working on the Vidzara codebase.

Agents MUST read and follow this file before making changes.

---

## Global Rules (Must Follow)

### Theme & Styling
- **Always use `@global.css` for theme variables** (colors, radius, shadows, typography tokens).
- **Never hardcode colors** (no hex, rgb, hsl in components).
- Use **CSS variables from `@global.css` only**.
- Respect light/dark modes via variables — **no conditional color hacks in components**.

---

### UI Components
- **Always use shadcn/ui components** for UI.
- If a required component does not exist, **add it to shadcn/ui** (do not recreate from scratch).
- Prefer **composition over custom styling**.
- Extend shadcn **variants** when customization is required.

---

### Package Manager
- **Always use `pnpm`** for installs, scripts, and commands.
- **Never use npm or yarn**.

---

### UI Quality Bar
- UI must be **modern, clean, and minimal**.
- Prefer **spacing, hierarchy, and subtle motion** over heavy visuals.
- Use **consistent radius, shadows, and typography** from the theme.
- Avoid clutter.
- Always provide **sensible empty states and loading states**.

---

### Code Structure & Organization
- **Never write all code in a single file**.
- Follow a **proper component-based architecture**.
- Split logic into **reusable components, hooks, and utilities** where appropriate.
- Maintain a **clear and scalable folder structure**  
  (`components`, `features`, `hooks`, `lib`, `styles`, etc.).
- Each component must have a **single clear responsibility**.
- Avoid **deeply nested or monolithic components**.

---

## 1. Project Identity

**Project Name:** Vidzara  
**Type:** Web-based AI SaaS  
**Domain:** Creator tools for YouTube, Shorts, Reels, and social media growth

**Product Definition:**  
Vidzara is a production-grade SaaS that helps creators generate, analyze, and optimize:
- Video SEO (titles, descriptions, tags, hashtags)
- Hooks and intros
- Long-form and short-form scripts
- Thumbnail concepts
- Topic research and competitor analysis
- Channel consistency and growth insights

This is **not** a demo, prototype, or experimental project.

---

## 2. Core Product Principles (NON-NEGOTIABLE)

- All features are visible to all users
- UI must reduce cognitive load, not hide functionality
- Consistency > cleverness
- Server-side logic is authoritative
- Client-side logic is never trusted
- Business rules are enforced server-side

Agents MUST NOT introduce feature hiding or gated UI unless explicitly instructed.

---

## 3. Final Technology Stack (DO NOT CHANGE)

### Frontend
- Next.js 
- TypeScript
- Tailwind CSS
- shadcn/ui

### shadcn Theme (from latest Create Web flow)
- Style: `maia`
- Base Color: `zinc`
- Theme Accent: `indigo`
- Font: `outfit`
- Icon Library: `tabler`
- Radius: `medium`
- Menu Accent: `bold`
- Menu Color: `inverted`
- Dark mode enabled

No other UI frameworks or component libraries are allowed.

---

### Backend
- Next.js Server Actions
- Next.js Route Handlers
- No separate backend service

---

### Database
- PostgreSQL
- Provider: Neon
- ORM: Prisma

Rules:
- Prisma schema is the single source of truth
- UUIDs preferred
- Avoid raw SQL unless unavoidable
- Never access the database directly from the client

---

### Authentication
- NextAuth (Auth.js)

Rules:
- Server-first authentication
- Session MUST include:
  - userId
  - plan
  - role

Forbidden:
- Supabase Auth
- Clerk
- Client-side auth enforcement

---

### Storage
- Supabase Storage (initial)
- Private buckets only
- Signed URLs generated server-side

Used for:
- User exports (PDF, CSV)
- Generated thumbnails (future)
- Admin assets

---

### Payments
- India: Razorpay
- Global: Stripe

Rules:
- Monthly and yearly subscriptions only
- Location-based pricing (INR / USD)
- Coupon system supported
- Subscription state driven by webhooks
- Fair usage enforced server-side

---

## 4. Feature Surface Area (ALL MUST REMAIN VISIBLE)

### Creation & Optimization
- Video SEO Generator
- Script Writer (Long + Shorts)
- Script Shortener
- Hook Detector
- Thumbnail Concept Generator
- Content Safety Checker

### Analysis & Growth
- Topic Generator (competitor-based)
- Outlier Detector
- Niche Finder
- Consistency Checker
- Creator Growth Dashboard

### Business
- Subscription management
- Usage limits (fair usage)
- Affiliate system
- Admin controls (future)

Agents MUST NOT remove, rename, or hide features without approval.

---

## 5. Routing & App Structure (App Router)

app/
├─ (marketing) // Public landing pages
├─ (auth) // Login, register, onboarding
├─ (dashboard) // Protected application


This separation MUST be preserved.

---

## 6. Dashboard UX Rules (MANDATORY)

### Layout
- Left sidebar: all features visible
- Top bar: global search, Create New, profile
- Main content: context-specific only

### Sidebar Grouping (REQUIRED)

Create
Optimize
Analyze
Growth
History
Billing
Affiliate
Settings


Agents MUST NOT present features as a flat list.

---

## 7. Middleware & Security

- All `/dashboard/*` routes are protected
- Authentication is validated server-side
- Plan, role, and usage checks are server-enforced
- Client flags MUST NOT grant access

---

## 8. AI Usage Rules

- All AI calls happen server-side
- Each feature must have:
  - a dedicated prompt template
  - usage logging
  - plan-based limits
- “Unlimited” plans still respect fair usage

Agents MUST NOT hardcode prompts inside UI components.

---

## 9. Code Organization Rules

- `/components` → UI only
- `/lib` → business logic, AI logic, utilities
- `/hooks` → client-side hooks only
- `/prisma` → schema and migrations

Feature logic MUST NOT live inside UI components.

---

## 10. Coding Standards

- TypeScript everywhere
- No `any`
- No client-side DB access
- No new frameworks without approval
- Prefer readability and maintainability

---

## 11. Explicitly Forbidden Actions

Agents MUST NOT:
- Introduce Firebase
- Introduce Supabase Auth
- Introduce Clerk
- Bypass Prisma
- Change architecture without approval
- Add new UI libraries
- Store secrets in client code

---

## 12. Required Agent Behavior

Agents SHOULD:
- Follow this file strictly
- Preserve existing structure
- Keep UI consistent
- Optimize for long-term SaaS maintainability
- Ask before architectural changes

---

## 13. Product Mindset

Vidzara is:
- A real SaaS business
- A long-term product
- A creator operating system

All contributions should reflect:
- Stability
- Scalability
- Professional engineering standards

---

END OF AGENTS.md
