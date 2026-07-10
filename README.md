# TapLink — NFC Store

A modern, cinematic e-commerce website for selling **NFC cards & tags** that help
businesses get more Google reviews, grow social media, share WiFi, open digital
menus, and link to their website — all with a single tap.

> **This README is the source of truth + audit log for the project.**
> Every meaningful change, decision, and piece of context is recorded here so a
> brand-new session (or a new developer) can catch up in minutes. **If you change
> something, update this file** — especially the [Change Log](#change-log) and
> [Roadmap](#roadmap).

---

## Table of contents

1. [Quick start](#quick-start)
2. [Deploying to Vercel](#deploying-to-vercel)
3. [Tech stack](#tech-stack)
4. [Project structure](#project-structure)
5. [Pages / routes](#pages--routes)
6. [Design system](#design-system)
7. [Product catalog (data model)](#product-catalog-data-model)
8. [Custom vs. standard design flow](#custom-vs-standard-design-flow)
9. [Cart & checkout](#cart--checkout)
10. [What is mocked / not yet real](#whats-mocked--not-yet-real)
11. [How to do common tasks](#how-to-do-common-tasks)
12. [Roadmap](#roadmap)
13. [Change log](#change-log)
14. [Notes for future sessions](#notes-for-future-sessions)

---

## Quick start

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (also runs type-check + lint)
npm run start    # serve the production build locally
npm run lint     # lint only
```

Requires **Node.js 18.18+** (built and verified on Node 22).

---

## Deploying to Vercel

This is a standard Next.js App Router project — Vercel auto-detects it.

1. Push this branch to GitHub (already the workflow here).
2. In Vercel, **Import Project** → pick this repo.
3. Framework preset: **Next.js** (auto). No build config changes needed.
   - Build command: `next build` (default)
   - Output: handled automatically
4. Deploy. Every push to the connected branch triggers a new deploy, so you
   see real-time changes.

### Environment variables

| Variable            | Required | What it does                                                        |
| ------------------- | -------- | ------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY` | For real payments | Enables Stripe Checkout. Without it, checkout falls back to a clearly-labelled test-order flow (no card charged). |

**To turn on real payments:**
1. Create a [Stripe](https://stripe.com) account → Dashboard → Developers → API keys.
2. Copy the **Secret key** (`sk_test_…` for test mode, `sk_live_…` for real money).
3. In Vercel → Project → **Settings → Environment Variables**, add
   `STRIPE_SECRET_KEY` with that value, then **Redeploy**.
4. Test with card number `4242 4242 4242 4242` (any future expiry/CVC) while
   using the `sk_test_` key. Swap to `sk_live_` when ready to take real money.

Order details (product, design choice, customer notes) appear in the Stripe
Dashboard on each payment under **metadata** — that's your fulfilment queue.

---

## Tech stack

| Concern         | Choice                                   |
| --------------- | ---------------------------------------- |
| Framework       | **Next.js 15** (App Router, TypeScript)  |
| UI runtime      | React 19                                 |
| Styling         | **Tailwind CSS 3.4** (custom dark theme) |
| Animation       | **framer-motion** (scroll reveals)       |
| Icons           | **lucide-react**                         |
| Utilities       | clsx + tailwind-merge (`cn()` helper)    |
| Fonts           | Inter (body) + Sora (display) via `next/font` |
| State           | React Context + `useReducer` (cart)      |
| Persistence     | `localStorage` (cart survives refresh)   |

There is **no database and no server/API layer yet** — the product catalog is a
static TypeScript file. This is intentional for a fast, deployable base.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, CartProvider, Navbar, Footer, metadata
│   ├── globals.css                 # Tailwind + custom base/component styles
│   ├── page.tsx                    # HOME / landing page (hero, use cases, best sellers, CTA)
│   ├── not-found.tsx               # Custom 404
│   ├── products/
│   │   ├── page.tsx                # Product listing (server) + category filter
│   │   └── [slug]/page.tsx         # Individual product page (SSG per product)
│   ├── checkout/page.tsx           # Cart + shipping form + order summary
│   ├── how-it-works/page.tsx       # Explains NFC + FAQ
│   ├── contact/page.tsx            # Contact form + details
│   └── legal/
│       ├── terms/page.tsx
│       ├── privacy/page.tsx
│       ├── shipping/page.tsx
│       └── returns/page.tsx
├── components/
│   ├── Navbar.tsx                  # Sticky nav w/ live cart count
│   ├── Footer.tsx
│   ├── Button.tsx                  # Button + ButtonLink (variants: primary/secondary/ghost)
│   ├── ProductCard.tsx             # Grid card
│   ├── ProductGrid.tsx             # Client grid w/ category filter
│   ├── ProductVisual.tsx           # CSS-rendered "product photo" (no images needed)
│   ├── ProductConfigurator.tsx     # Standard/Custom choice + upload/we-design + add to cart
│   ├── LegalLayout.tsx             # Shared layout for legal pages
│   └── Reveal.tsx                  # framer-motion fade-in-on-scroll wrapper
├── context/
│   └── CartContext.tsx             # Cart state, localStorage persistence, useCart() hook
└── lib/
    ├── products.ts                 # PRODUCT CATALOG (single source of truth) + types
    ├── site.ts                     # Brand config: name, contact, shipping rules
    └── utils.ts                    # cn() + formatPrice()
```

---

## Pages / routes

| Route                     | What it is                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| `/`                       | Landing page — cinematic hero, use cases, best sellers, custom-design banner, CTAs |
| `/products`               | All products with a category filter                              |
| `/products/[slug]`        | Individual product: visual, description, features, specs, and the **configurator** |
| `/checkout`               | Cart items, shipping form, order summary, place-order flow       |
| `/how-it-works`           | How NFC tapping works + FAQ                                      |
| `/contact`                | Contact form + email/phone                                       |
| `/legal/terms`            | Terms of Service                                                 |
| `/legal/privacy`          | Privacy Policy                                                   |
| `/legal/shipping`         | Shipping Policy                                                  |
| `/legal/returns`          | Returns & Refunds                                               |

---

## Design system

Modern, professional, cinematic — dark and glowing.

- **Surface:** deep near-black `ink` palette (`#05060a` → `#272b42`).
- **Brand accent:** electric violet → cyan gradient (`brand.500 #6d5efc` → `cyanx.400 #22d3ee`),
  exposed as the `bg-brand-gradient` / `.text-gradient` utilities.
- **Type:** `Sora` for display/headlines, `Inter` for body (CSS vars `--font-sora`, `--font-inter`).
- **Effects:** frosted glass (`.glass`), dot-grid texture (`.grid-texture`), soft glows
  (`shadow-glow`, `shadow-glow-cyan`), floating/pulse/shimmer keyframe animations.
- **Motion:** `Reveal` component fades content up as it scrolls into view (restrained, once-only).
- **Product imagery:** `ProductVisual` renders a stylised NFC card in pure CSS using each
  product's `accent` gradient — so the site needs **zero image assets** and stays fast.
  Swap this for real photography later without touching page layouts.

All theme tokens live in `tailwind.config.ts`. Change the brand there once and it
propagates everywhere.

---

## Product catalog (data model)

All products live in **`src/lib/products.ts`** as a typed array. Shape:

```ts
interface Product {
  id: string;
  slug: string;              // URL: /products/<slug>
  name: string;
  category: ProductCategory; // "Google Reviews" | "Social Media" | ... (drives the filter)
  formFactor: FormFactor;    // "Card" | "Sticker" | "Keychain" | "Stand" | "Band"
  tagline: string;
  summary: string;           // short (grid cards)
  description: string;       // long (detail page)
  basePrice: number;         // standard design price
  customUpcharge: number;    // added when customer picks "custom"
  features: string[];
  useCases: string[];
  specs: { label: string; value: string }[];
  accent: [string, string];  // gradient stops for the CSS visual
  popular?: boolean;         // shows a "Popular" badge + appears in Best Sellers
}
```

**8 products** ship in the base build: Google Review Card, Google Review Stand,
Social Media Card, Digital Business Card, Menu Tag, WiFi Tag, Keychain Tag, and
the All-in-One Link Card.

Brand-wide values (store name, contact info, shipping rates/thresholds) live in
**`src/lib/site.ts`**.

---

## Custom vs. standard design flow

This is the core requested feature. On every product page, the `ProductConfigurator`
lets the customer choose:

1. **Standard** — clean ready-made design at `basePrice`.
2. **Custom** — `basePrice + customUpcharge`, with a sub-choice:
   - **Upload my design** — file picker (PNG/PDF/AI/SVG…). Currently the file
     **name** is captured and attached to the order note (real file upload is a
     TODO — see [What's mocked](#whats-mocked--not-yet-real)).
   - **Design it for me** — customer writes a brief; our team designs it.
   - A notes/brief textarea is included either way.

The choice, method, and note are stored on the cart item and shown in the cart so
nothing gets lost.

---

## Cart & checkout

- Cart state: `src/context/CartContext.tsx` (`useCart()` hook). Add / remove /
  change quantity / clear. Identical configurations stack via a composite `key`
  (`slug::designType::customMethod`).
- Persisted to `localStorage` (`taplink-cart-v1`) so it survives refreshes.
- Navbar shows a live item count badge.
- `/checkout` lists items, collects shipping details, computes shipping
  (flat rate, free over threshold from `site.ts`) + total, and on submit shows an
  order-confirmation state and clears the cart.

---

## What's mocked / not yet real

| Area              | Current behaviour                        | To make real                                  |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| **Payments**      | ✅ **REAL** — Stripe Checkout via `/api/checkout` once `STRIPE_SECRET_KEY` is set. Prices recomputed server-side (tamper-proof). Falls back to a labelled test-order flow without the key. | Add the env var (see [Environment variables](#environment-variables)) |
| **Order storage** | Paid orders live in the Stripe Dashboard (with design notes in metadata) | Optionally add a DB + email notifications      |
| **File uploads**  | Captures filename only (attached to order metadata) | Upload to storage (e.g. Vercel Blob/S3) + attach URL |
| **Contact form**  | Simulates send                           | Wire to an email service / form endpoint       |
| **Testimonials**  | ⚠️ Placeholder quotes, visibly labelled "Example" (`src/components/Testimonials.tsx`) | Replace with real customer quotes (with permission). **Never ship invented testimonials as real — FTC rules prohibit it.** |
| **Analytics**     | None                                     | Add Vercel Analytics or similar                |

---

## How to do common tasks

- **Add a product:** append an object to `products` in `src/lib/products.ts`
  (pick a unique `slug`). It automatically appears in the grid, gets its own SSG
  page, and joins the category filter. Set `popular: true` to feature it.
- **Rebrand:** edit `src/lib/site.ts` (name/contact/shipping) and the color tokens
  in `tailwind.config.ts`.
- **Change shipping rates / free-shipping threshold:** `site.shipping` in `src/lib/site.ts`.
- **Edit legal copy:** the four files under `src/app/legal/`.
- **Add a nav link:** `links` array in `src/components/Navbar.tsx` (and `Footer.tsx`).

---

## Roadmap

Ordered roughly by priority. Update as things get done.

- [x] **Payments** — Stripe Checkout integrated; just add `STRIPE_SECRET_KEY` in Vercel.
- [ ] **Replace placeholder testimonials with real customer quotes** (legally required before ads).
- [ ] **Order backend** — persist orders + send confirmation emails (Stripe webhook → email).
- [ ] **Real file uploads** for custom artwork (Vercel Blob / S3).
- [ ] **Contact form backend** (email delivery).
- [ ] Product photography / 3D to replace CSS `ProductVisual` (optional).
- [ ] Volume / bulk pricing tiers.
- [ ] Admin view to manage products without editing code (CMS or DB).
- [ ] Analytics + basic SEO polish (sitemap, richer OG images).
- [ ] Accounts / order history (if desired).

---

## Change log

Newest first. **Add an entry for every meaningful change.**

### 2026-07-10 — Real-world overhaul: Stripe, photos, volume pricing, conversion copy
- **Stripe Checkout is live** (`src/app/api/checkout/route.ts`): server-side
  price computation from the catalog (client can't tamper), shipping address +
  phone collected by Stripe, free-shipping threshold honoured, design/custom
  notes passed as metadata for fulfilment, `/checkout/success` landing page.
  Falls back to a labelled test-order flow when `STRIPE_SECRET_KEY` is unset.
- **Volume pricing** (`src/lib/pricing.ts`): 3+ → 10% off, 5+ → 15%, 10+ → 20%.
  Pack selector (Single/3/5/10) in the configurator with live savings; applied
  consistently in cart, order summary, and the Stripe charge.
- **Real photography** (`public/images/`, 8 photos, Unsplash license — free for
  commercial use): full-bleed hero (customer tapping at a counter), industries
  grid (barbershop, café, restaurant, salon, food truck), custom-design banner.
- **Copy rewritten for conversion**: counter-moment hero, attributed stat
  (BrightLocal 98%), "It happens at the counter" 3-step play, NFC vs QR vs
  asking comparison table, 30-day guarantee section, objection-focused FAQ
  ("Is this against Google's rules?"), announcement bar, trust rows on product
  + checkout pages, "What happens after you order" timeline.
- **Testimonials section added with visibly-labelled placeholder quotes** —
  must be swapped for real ones before running ads (see the table above).
- Flagship product copy (review card, review stand) rewritten around the
  real-world counter moment.
- Verified: `npm run build` clean; smoke-tested pages, images, demo checkout,
  and tamper rejection on a running production server.

### 2026-07-10 — Upgrade Next.js to patched 15.5.20 (security)
- Bumped `next` and `eslint-config-next` from `15.1.6` → `15.5.20` to resolve
  the deprecation/security warning (CVE-2025-66478) that Vercel flagged during
  build. Same major line, no code changes needed; `npm run build` passes clean
  (20 routes, 8 product pages prerendered).

### 2026-07-10 — Fix Vercel deploy (framework detection)
- Added `vercel.json` with `"framework": "nextjs"`. Vercel had imported the
  project as a static/"Other" site and failed with *"No Output Directory named
  'public' found"*. Declaring the framework forces the correct Next.js build.
- If the error persists after redeploy, also set **Framework Preset → Next.js**
  in Vercel → Project → Settings → Build & Deployment, then Redeploy.

### 2026-07-10 — Initial build (base scaffold)
- Scaffolded Next.js 15 + TypeScript + Tailwind 3.4 project (manual scaffold; the
  folder name `NFC-Project` has capitals which `create-next-app` rejects, so
  config was written by hand; npm package name is `nfc-store`).
- Built the cinematic dark design system (theme tokens, gradients, glows,
  animations, fonts).
- Implemented pages: **home, products, product detail (SSG), checkout,
  how-it-works, contact, 404**, and **4 legal pages** (terms, privacy, shipping,
  returns).
- Added **8-product catalog** in `src/lib/products.ts` covering Google reviews,
  social, business card, menu, WiFi, keychain, and all-in-one.
- Built the **custom/standard configurator** with "upload my design" vs.
  "design it for me", notes, and quantity.
- Built **cart** (Context + reducer + localStorage) and **checkout** with
  shipping calc and order-confirmation flow.
- Payments, order storage, uploads, and the contact form are intentionally
  mocked (see the table above).
- `npm run build` passes cleanly: 20 routes generated, 8 product pages
  prerendered, no type/lint errors.

---

## Notes for future sessions

- **Read this whole README first** — it captures every decision and what is / isn't
  real. Then skim `src/lib/products.ts` and `src/lib/site.ts` (all the content
  knobs) and `src/components/ProductConfigurator.tsx` (the core custom-design UX).
- Lifestyle photos live in `public/images/` (Unsplash license, commercial use
  OK). Product "photos" are still CSS-rendered (`ProductVisual`) using each
  product's accent gradient — replace with real product photography when
  available.
- Keep the working branch as instructed and **commit + push** when a unit of work
  is done. Update the [Change Log](#change-log) and [Roadmap](#roadmap) in the same
  commit.
- Legal pages are **templates, not legal advice** — there's an on-page disclaimer;
  keep it.
