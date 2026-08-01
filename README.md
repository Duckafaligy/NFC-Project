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
10. [Sales tax](#sales-tax)
11. [What is mocked / not yet real](#whats-mocked--not-yet-real)
12. [How to do common tasks](#how-to-do-common-tasks)
13. [Roadmap](#roadmap)
14. [Change log](#change-log)
15. [Notes for future sessions](#notes-for-future-sessions)

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
| `STRIPE_WEBHOOK_SECRET` | For stock sync | Signing secret for `/api/stripe-webhook` (events: `checkout.session.completed`, `charge.refunded`). Paid orders subtract stock, full refunds add it back. Orders themselves are read live from Stripe, so without this you still see every order — you just adjust stock by hand. |
| `ADMIN_PASSWORD`    | Strongly recommended | Password for /admin-dashboard. Until set, the owner-chosen default hardcoded in `src/lib/adminAuth.ts` works (visible to anyone with repo access — the dashboard warns until the env var exists). |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | For persistent admin settings | Auto-created by the Vercel/Upstash KV integration (Storage tab). Without them, stock/price/pre-order edits reset on redeploy or cold start. Orders are never stored here, so none can be lost. |
| `NEXT_PUBLIC_SITE_URL` | Once on a custom domain | Public base URL. If unset, Vercel's own production domain is used automatically (enable **Automatically expose System Environment Variables** in project settings). Feeds canonical/OG URLs, the sitemap, Stripe redirects and the product image URLs sent to Stripe. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | **Yes, before selling** | The address customers are told to write to — all four legal pages, the success page and the footer of every Stripe invoice. Until set it shows a placeholder that does not exist. |
| `STRIPE_TAX_ENABLED` | Only once registered | Set to `1` to charge sales tax. See [Sales tax](#sales-tax). Leave unset until Stripe Tax is activated — turning it on early makes every checkout fail. |

**To turn on real payments:**
1. Create a [Stripe](https://stripe.com) account → Dashboard → Developers → API keys.
2. Copy the **Secret key** (`sk_test_…` for test mode, `sk_live_…` for real money).
3. In Vercel → Project → **Settings → Environment Variables**, add
   `STRIPE_SECRET_KEY` with that value, then **Redeploy**.
4. Test with card number `4242 4242 4242 4242` (any future expiry/CVC) while
   using the `sk_test_` key. Swap to `sk_live_` when ready to take real money.

**Full test-payment walkthrough (test mode):**
1. With `sk_test_…` set, add any card to the cart and hit **Pay securely** —
   you land on Stripe's hosted checkout showing each line's full
   configuration (routing, design choice, notes, pre-order price).
2. Pay with `4242 4242 4242 4242`, any future expiry, any CVC/ZIP. Declines
   can be tested with `4000 0000 0000 0002`.
3. You're redirected to `/checkout/success`, which fetches the order and
   shows an **on-page invoice**: line items, discount, shipping, total, plus
   **View invoice** / **Download PDF** buttons (Stripe-hosted invoice).
4. The order appears under **Recent orders** in /admin-dashboard with the full
   delivery address (read live from Stripe). If the webhook is connected,
   stock drops too.
5. Refund the payment in the Stripe dashboard → stock goes back up and the
   order is flagged **Refunded**.

**Invoices:** every paid order creates a Stripe invoice automatically
(`invoice_creation` on the Checkout Session) and the success page displays it
with **View invoice** / **Download PDF** links. The site sends no email of its
own — to have Stripe email the invoice, enable Stripe Dashboard → **Settings →
Emails** → "Email finalized invoices to customers".

**Syncing the catalog into Stripe:** /admin-dashboard has a **Sync products
to Stripe** button (`/api/admin/stripe-sync`). It creates/updates one Stripe
Product per card with three prices each (standard / custom-upload /
custom-we-design, stable lookup keys). Idempotent — rerun after any price
change in `src/lib/products.ts`. Checkout still charges via inline
`price_data` because the pre-order discount changes amounts dynamically.

**Orders come from Stripe, not from us.** /admin-dashboard reads
`/api/admin/orders`, which lists Checkout Sessions live — delivery address,
recipient, phone, shipping paid, lines. Nothing is copied into KV, so no order
can be lost if KV is absent. Marking one shipped writes `fulfilled_at` and
`tracking` into that session's own metadata (and refunds write `refunded`), so
fulfilment state lives with the order in Stripe and is visible there too.

KV therefore only holds store settings — stock, prices, pre-order flags. Losing
it costs you a stock count, never a customer's address.

---

## Tech stack

| Concern         | Choice                                   |
| --------------- | ---------------------------------------- |
| Framework       | **Next.js 15** (App Router, TypeScript)  |
| UI runtime      | React 19                                 |
| Styling         | **Tailwind CSS 3.4** (light theme, blue accent) |
| Animation       | **framer-motion** (scroll reveals)       |
| Icons           | **lucide-react**                         |
| Utilities       | clsx + tailwind-merge (`cn()` helper)    |
| Fonts           | Inter (body) + Archivo (display) via `next/font` |
| State           | React Context + `useReducer` (cart)      |
| Persistence     | `localStorage` (cart) + Upstash Redis (store settings) |

The product catalog is a static TypeScript file (`src/lib/products.ts`); there
is no product database. Everything mutable lives elsewhere on purpose: store
settings (stock, prices, pre-order) in Upstash Redis, and orders in Stripe.

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
│   ├── checkout/page.tsx           # Cart + destination + order summary
│   ├── checkout/success/page.tsx   # Post-payment receipt + invoice links
│   ├── admin-dashboard/            # Password-walled store controls
│   ├── sitemap.ts / robots.ts      # SEO
│   ├── t/[code]/route.ts           # NFC tap -> redirect (tag hub)
│   ├── tag/[code]/page.tsx         # Customer claims / re-points their tag
│   ├── api/
│   │   ├── checkout/               # Create Stripe session; look one up
│   │   ├── stripe-webhook/         # Stock decrement + refund restock
│   │   ├── store-status/           # Public: stock, prices, pre-order, tax
│   │   ├── tag/[code]/             # Tag claim + update
│   │   └── admin/                  # state, login, logout, orders, fulfil, stripe-sync
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
│   ├── ProductVisual.tsx           # Real card artwork (public/images/products)
│   ├── PreorderPopup.tsx           # Pre-order modal, fires after the hero
│   ├── ProductConfigurator.tsx     # Standard/Custom choice + upload/we-design + add to cart
│   ├── LegalLayout.tsx             # Shared layout for legal pages
│   └── Reveal.tsx                  # framer-motion fade-in-on-scroll wrapper
├── context/
│   ├── CartContext.tsx             # Cart state, localStorage persistence, useCart() hook
│   └── StoreStatus.tsx             # Live stock/prices/pre-order/tax from the API
└── lib/
    ├── products.ts                 # PRODUCT CATALOG (single source of truth) + types
    ├── site.ts                     # Brand config, currency, shipping zones
    ├── shipping.ts                 # Zones, quantity tiers, form-factor units
    ├── pricing.ts                  # Pre-order discount + cent conversion
    ├── adminStore.ts               # Store settings in Upstash Redis (no orders)
    ├── adminAuth.ts                # Dashboard password + session token
    ├── tags.ts / tagPresets.ts     # Tag hub: claim, re-point, tap counting
    ├── kv.ts                       # Upstash REST helper for the tag hub
    └── utils.ts                    # cn() + formatPrice()
```

---

## Pages / routes

| Route                     | What it is                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| `/`                       | Landing page — cinematic hero, use cases, best sellers, custom-design banner, CTAs |
| `/products`               | All products with a category filter                              |
| `/products/[slug]`        | Individual product: visual, description, features, specs, and the **configurator** |
| `/checkout`               | Cart items, destination selector, order summary, pay             |
| `/checkout/success`       | Receipt: lines, shipping, tax, delivery address, invoice links   |
| `/admin-dashboard`        | Password-walled: prices, stock, pre-order, orders, Stripe sync   |
| `/t/[code]`               | NFC tap → 302 to the tag's destination                           |
| `/tag/[code]`             | Customer claims a tag and re-points it without a reprint         |
| `/legal/terms`            | Terms of Service                                                 |
| `/legal/privacy`          | Privacy Policy                                                   |
| `/legal/shipping`         | Shipping Policy                                                  |
| `/legal/returns`          | Returns & Refunds                                               |

---

## Design system

**Light and quiet, one blue accent.** White page, hairline borders, tight
corners. The product artwork is the only place strong colour appears.

- **Surfaces:** white page; white cards via `.card` (rounded-md, neutral-200
  hairline, faint `shadow-soft`); neutral-50/100 panels for section
  contrast; one neutral-900 panel for the closing CTA.
- **Text:** neutral-900 headings, neutral-600 body, neutral-400 secondary.
- **Accents are semantic and sparing:**
  - **#2E7DFF (blue)**: logo mark, primary accent, active states, step
    numbers, progress rails. `#1B5FD9` when it needs to pass contrast on
    white.
  - **emerald**: discounts, guarantees, shipped state (money/positive)
  - **violet**: everything pre-order (badges, price chips)
  - **amber `#F5A623`**: review stars, matching the printed cards
  Keep to these; do not introduce another hue.
- **Buttons:** rounded-md; primary = neutral-900 fill, secondary = white with
  a neutral border that darkens on hover. One CTA per section — "Check it
  out" is the standard label.
- **Radius scale:** rounded-md for cards/buttons/inputs, rounded-sm for tiny
  chips, rounded-2xl only for large feature panels.
- **Type:** Archivo display (`font-display`), Inter body, sentence case.
- **Motion:** `Reveal` for scroll fade-ins; the hero scrubs on scroll; the
  step and gallery timers use `useAutoAdvance`, which writes progress
  straight to the DOM so pausing freezes rather than restarts. Everything
  respects `prefers-reduced-motion`.
- **Product visuals:** the real card artwork from
  `public/images/products/*.webp`, rendered by `ProductVisual`. The Google
  card always shows both faces, because it ships white one side and black the
  other.

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

**5 products** ship in the current build, and they are all the same physical
card programmed (routed) differently: Google Review Card, Social Media Card,
Menu Card, Website Card, and the Digital Business Card (the all-in-one
flagship at $49.99 base / $56.99 custom). Because it's one physical card,
stock is a single shared pool managed from `/admin-dashboard`.

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
- `/checkout` lists items, has a **Ship to** region selector that binds the
  matching destination rate (from `site.shipping.zones`) + total, and on
  submit opens Stripe Checkout (or the labelled test-order flow without a key).

---

## Sales tax

**None of this is tax advice — confirm your own situation with an accountant
or the CRA.** What follows is how the code behaves and the order to do things
in.

### Do you even have to charge it?

In Canada you are a **small supplier** until your gross revenue passes
**$30,000 CAD across four consecutive calendar quarters**. Under that you are
not required to register for GST/HST, and **if you are not registered you must
not charge it** — collecting tax you are not registered for is its own
problem. So for a store just opening, `STRIPE_TAX_ENABLED` unset is very
probably the correct setting.

Once you cross the threshold (or register voluntarily, which some do to claim
input tax credits) you must register with the CRA and start charging.

Selling into the **US** is separate: state sales tax is only owed once you
have *economic nexus* in a state — typically $100k of sales or 200
transactions into that one state per year. A Canadian seller shipping a few
cards into the US almost certainly has none, so do not register US states
until the numbers say you must.

### Turning it on

Do these in order. Steps 1-4 are in Stripe and only you can do them.

1. **Register with the CRA** and get your GST/HST number. Quebec (QST), BC,
   Saskatchewan and Manitoba run their own provincial registrations with their
   own thresholds — check whether you need those too.
2. **Stripe Dashboard → Tax** → activate Stripe Tax. It will ask for your
   **origin address** (your Canadian business address) — this is what decides
   domestic vs cross-border.
3. **Tax → Registrations** → add your CRA registration (Canada, GST/HST), plus
   any provincial ones. Stripe only charges tax where you have told it you are
   registered, so this list is what actually drives collection.
4. Leave the **default product tax code** as tangible goods. The sync already
   stamps `txcd_99999999` on every product and the checkout stamps
   `txcd_92010001` on shipping, so you should not need to touch either.
5. **Vercel → Settings → Environment Variables** → add `STRIPE_TAX_ENABLED=1`
   → **Redeploy**.
6. Confirm in **/admin-dashboard → Connections**: the *Sales tax* row turns
   green. Then run a test order and check tax appears on Stripe's payment
   page before you pay.

### Why it is behind a flag

`automatic_tax` is rejected by Stripe until Stripe Tax is activated on the
account. If the code sent it unconditionally, every checkout session would
fail the moment it deployed — the whole store, not just the tax line. The flag
means the default path is the safe one.

### What the code does when it is on

- Line items and the shipping rate both go up as `tax_behavior: "exclusive"`,
  i.e. tax is added on top of the listed price rather than assumed to be
  inside it. That is the norm in Canada and the US.
- Shipping carries its own tax code because **shipping is taxable in Canada**.
  Miss that and you under-collect on every order.
- `/checkout` relabels its total to **"Total before tax"** and adds a
  "calculated at payment" row, since the real number depends on the address
  the buyer has not entered yet.
- The success page and the Stripe invoice both show the tax actually charged.

### Filing

Stripe calculates and collects; it does **not** remit for you. **Stripe
Dashboard → Tax → Registrations → Reports** gives you the totals per
jurisdiction to file your GST/HST return with. Filing frequency (annual,
quarterly, monthly) is set by the CRA when you register.

---

## What's mocked / not yet real

| Area              | Current behaviour                        | To make real                                  |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| **Payments**      | ✅ **REAL** — Stripe Checkout via `/api/checkout` once `STRIPE_SECRET_KEY` is set. Prices recomputed server-side (tamper-proof). Falls back to a labelled test-order flow without the key. | Add the env var (see [Environment variables](#environment-variables)) |
| **Order storage** | ✅ **REAL** — read live from Stripe via `/api/admin/orders`, with delivery address, shipping paid and fulfilment state. Nothing is duplicated locally. | Nothing needed |
| **Sales tax**     | Off. Correct while under the CRA $30k small-supplier threshold. | See [Sales tax](#sales-tax) |
| **Customer email**| None sent. Stripe emails the receipt/invoice if enabled in its settings. | Add Resend for a shipped-with-tracking notification |
| **File uploads**  | Captures filename only (attached to order metadata) | Upload to storage (e.g. Vercel Blob/S3) + attach URL |
| **Testimonials**  | ⚠️ Placeholder quotes, visibly labelled "Example" (`src/components/Testimonials.tsx`) | Replace with real customer quotes (with permission). **Never ship invented testimonials as real — FTC rules prohibit it.** |
| **Analytics**     | None                                     | Add Vercel Analytics or similar                |
| **SEO**           | ✅ sitemap.xml, robots.txt, per-product canonical + OG tags, Product JSON-LD with live price/availability | Nothing needed |

---

## How to do common tasks

- **Add a product:** append an object to `products` in `src/lib/products.ts`
  (pick a unique `slug`). It automatically appears in the grid, gets its own SSG
  page, and joins the category filter. Set `popular: true` to feature it.
- **Rebrand:** edit `src/lib/site.ts` (name/contact/shipping) and the color tokens
  in `tailwind.config.ts`.
- **Change shipping rates / zones / countries:** `site.shipping.zones` in `src/lib/site.ts`. Each zone has quantity `tiers` (`{ minQty, price }` brackets — the charge is the highest tier whose `minQty` ≤ the order quantity), plus `countries` and `etaMin`/`etaMax`. The buyer's address is locked to the `countries` of the region they pick, and the tier for their card count is bound to Stripe.
- **Edit legal copy:** the four files under `src/app/legal/`.
- **Add a nav link:** `links` array in `src/components/Navbar.tsx` (and `Footer.tsx`).

---

## Roadmap

Ordered roughly by priority. Update as things get done.

- [x] **Payments** — Stripe Checkout integrated; just add `STRIPE_SECRET_KEY` in Vercel.
- [ ] **Replace placeholder testimonials with real customer quotes** (legally required before ads).
- [ ] **Order backend** — persist orders + send confirmation emails (Stripe webhook → email).
- [ ] **Real file uploads** for custom artwork (Vercel Blob / S3).
- [ ] Product photography / 3D to replace CSS `ProductVisual` (optional).
- [ ] Volume / bulk pricing tiers.
- [ ] Admin view to manage products without editing code (CMS or DB).
- [ ] Analytics + basic SEO polish (sitemap, richer OG images).
- [ ] Accounts / order history (if desired).

---

## Change log

Newest first. **Add an entry for every meaningful change.**

### 2026-08-01 — Production configuration: identity, SEO, tax, orders from Stripe

- **Site identity is no longer a placeholder.** `site.url` resolves from
  `NEXT_PUBLIC_SITE_URL`, else Vercel's own production domain, else
  localhost. It was hardcoded to `https://taplink.example`, which meant
  `metadataBase`, the Stripe redirect fallback and the product image URLs
  handed to Stripe all pointed at a domain that does not exist.
  `site.email` now reads `NEXT_PUBLIC_CONTACT_EMAIL`; it appears on all four
  legal pages and in every invoice footer.
- **SEO existed nowhere.** Added `sitemap.ts` and `robots.ts` (tag hub and
  admin excluded), per-product canonical + OpenGraph tags with the real card
  artwork, and Product JSON-LD carrying live price and stock. Product pages
  revalidate every 5 minutes so that structured data cannot contradict the
  page. `/tag/*` also carries a header-level noindex.
- **Orders read from Stripe** via `/api/admin/orders` instead of a KV copy
  that could be lost on a cold start. Fulfilment state (shipped, tracking,
  refunded) lives in the session's own metadata.
- **Sales tax** wired through `automatic_tax` with tax codes on goods and
  shipping, gated behind `STRIPE_TAX_ENABLED`. See [Sales tax](#sales-tax).
- **Shipping charges by form factor** — `SHIPPING_UNITS` counts a stand as 3
  cards, since a boxed stand cannot ship at the flat-mailer rate.
- Dashboard **Connections** panel now reports all six: Stripe, webhook, KV,
  site URL, contact email, sales tax.

### 2026-07-13 — Stripe invoices with full order configuration
- **Post-payment invoices enabled** (`invoice_creation` on the Checkout
  session): every paid order now generates a Stripe invoice. Line items
  carry the complete configuration — routing category, standard/custom,
  who designs it, the customer's note, and the pre-order discount — and
  the invoice adds an "Order type" field, a pre-order/thank-you
  description, and the free-maintenance promise in the footer.
- To have Stripe email invoices automatically: Stripe Dashboard >
  Settings > Billing > Invoices > "Email finalized invoices".

### 2026-07-13 — Webhook hardening, refunds, order log, low-stock email, pre-order auto-end
- **Exactly-once webhook processing:** every Stripe event id is claimed in
  the store (7-day TTL) before handling, so Stripe's retries/duplicate
  deliveries can never subtract stock twice. Verified with a signed
  synthetic event: first delivery processes, replay returns
  `duplicate: true`, bad signatures 400.
- **Refund restock:** `charge.refunded` (full refunds only) adds the
  order's quantity back to the pool and flags the order refunded in the
  log; partial refunds stay a manual dashboard adjustment. The Stripe
  endpoint now needs both events: `checkout.session.completed` +
  `charge.refunded`.
- **Order log in the dashboard:** the webhook records the last 50 orders
  (items, quantity, total, customer email, pre-order + refunded badges),
  shown in a Recent orders card. No more opening Stripe to see what to
  fulfil.
- **Low-stock email alert:** when a paid order drops the pool from above
  10 to 10 or below, one email goes out via Resend's REST API (needs
  `RESEND_API_KEY` + `LOW_STOCK_ALERT_EMAIL`; silently skipped otherwise;
  the dashboard shows which state you're in).
- **Pre-order auto-end date:** optional date field under the pre-order
  toggle; `effectivePreorder()` reports false once the end of that day
  passes, so discounts/labels stop site-wide with no manual flip.
  Verified: past date → storefront immediately shows pre-order off.
- Footer shop links updated for the 5-card catalog (the removed
  all-in-one slug 404'd).

### 2026-07-12 — Admin dashboard, 5-card catalog with shared stock, Stripe stock sync
Two parallel sessions built the dashboard; merged: the live KV architecture
won, the git-commit persistence variant was dropped.
- **Catalog restructured to five products, all the same physical card**
  routed differently: Google Review Card, Social Media Card, Menu Card
  (was a sticker, now a card), **Website Card (new)**, and the Digital
  Business Card as the all-in-one flagship at **$49.99 base / $56.99
  custom** (+$4.99 we-design fee). Review Stand, WiFi Tag, Keychain Tag,
  and the separate All-in-One card are gone; copy referencing them
  updated. Cart storage key bumped to v3.
- **Shared stock pool.** Because every product is the same card, stock is
  ONE number (`cardStock` in lib/adminStore), shown by the stock bar on
  every product page as N of the 50-card print run
  (DEFAULT_CARD_STOCK/STOCK_BATCH in products.ts).
- **/admin-dashboard** (noindex): password wall with Apple-style per-IP
  lockout — 10 failed attempts lock 1 minute, further failures escalate
  5/15/60 minutes with a live countdown; the correct password is also
  rejected while locked. Sessions are 2-hour signed HttpOnly cookies.
  The default password is owner-chosen and hardcoded in adminAuth.ts;
  setting `ADMIN_PASSWORD` overrides it (and invalidates old sessions) —
  the dashboard warns until then. Inside: Has stock / Out of stock toggle
  with one shared quantity input, and a pre-order ON/OFF switch.
- **Live wiring**: `/api/store-status` + `StoreStatusProvider` feed the
  storefront; product pages show the live shared stock bar and disable
  buying at 0, cart/checkout/product cards price by the live pre-order
  flag, and the Stripe checkout route enforces both (409 when the cart
  exceeds the pool, charges by the live flag).
- **Stripe stock sync** (`/api/stripe-webhook`): on
  `checkout.session.completed`, the order's total quantity is subtracted
  from the shared pool instantly. Set the endpoint up in Stripe
  (Developers > Webhooks, event `checkout.session.completed`) and put its
  signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Persistence**: Vercel/Upstash KV via REST when the env vars exist;
  otherwise in-memory (resets on redeploy — the dashboard warns).
- Verified end to end with curl + browser: 401 wall, 10-fail lockout with
  correct-password-while-locked rejected, per-IP isolation, save > public
  status > storefront out-of-stock UI > checkout 409.

### 2026-07-11 — One rotating banner, chart tooltip fix, industries layout fix, Times New Roman
- **Consolidated to a single promo band.** The static topbar above the
  navbar (`AnnouncementBar`) and the old color-dot ticker (`Ticker`) are
  both deleted; one `PromoBanner` below the hero replaces them. It is a
  continuous ticker: the topbar's offers plus the ticker's stats glide
  sideways in an endless seamless loop (track rendered twice, translated
  -50%), each item carrying a semantic lucide icon (BadgePercent,
  TrendingUp, Truck, Timer, ShieldCheck, Infinity) instead of the old
  color-dot squares, with generous gap-16 spacing. Pauses on hover;
  duplicate copy is aria-hidden with links untabbable.
- **Fixed the growth chart tooltip.** Hovering months 4-6 used to overlap the
  permanent "312" / "54" end-value labels, cluttering the chart. The end
  labels now hide while a tooltip is active, and the tooltip keeps a fixed
  12px gap from the point instead of a percentage offset that let it drift
  into the crosshair.
- **Fixed the "Who it's for" industries grid.** The trailing "Your business"
  CTA tile used to land alone in a new row at 1/4 grid width, leaving a large
  empty gap beside it. It now spans the full row as a horizontal banner.
- **Fonts: Archivo (display) + Inter (body).** Times New Roman was tried
  first at the owner's request but didn't land; Playfair Display next, but
  the owner read it as cursive. Settled on Archivo, a grotesque designed
  for print headlines: bold, clean, no decorative strokes, supports the
  800/900 weights used across headings. Inter stays for body copy. Both
  load via `next/font/google`.
- **Growth chart rebuilt** (`GrowthChart`): gradient area fills under both
  series, always-visible data-point dots (enlarge on hover), hovered month
  label highlights, tooltip gains a "Nx more with the card" comparison
  line, Y-scale tightened (330 max) so the lines fill the plot, and the
  crosshair/tooltip now follows pointer events so it works on touch
  devices, with `touch-action: pan-y` preserving page scroll.
- **Ticker polish:** gap widened to gap-28 so about four items are visible
  at desktop width, and gradient edge fades dissolve items in and out
  instead of hard-clipping at the band edges.
- **Calculator sliders restyled** (`.slider` in globals.css): custom white
  square thumbs with emerald borders and an emerald fill painted up to the
  thumb (inline gradient), replacing the default browser range look. Steps
  changed from 5 to 1 on both sliders for finer control.
- **Stock bar on product pages** (`StockBar`, under the price in the
  configurator). Research-backed tiers (specific counts beat vague
  warnings; escalate only when genuinely low): emerald "In stock — ready
  to ship" while healthy, amber "Only N left — almost gone" with a pulsing
  dot at LOW_STOCK (10) or below, gray out-of-stock state. Animated fill
  shows stock/STOCK_BATCH (50, one print run). Data is a new `stock` field
  per product in products.ts — **owner must keep these numbers honest and
  current**; stale scarcity destroys trust and can breach consumer rules.
- **Policy change: no refunds, 30 days of free maintenance instead.** All
  "money-back guarantee" / "full refund" copy replaced site-wide (hero,
  stat tile, promo ticker with a Wrench icon, guarantee banner, checkout
  trust row, configurator trust row, footer labels). `/legal/returns` is
  now the Maintenance Policy: all sales final; within 30 days of delivery
  any problem is corrected free, by shipping the product back or an
  on-site visit where offered; lifetime free replacement if a card stops
  scanning stays. Route URL unchanged so existing links keep working.
- Verified with a clean `npm run build` and headless-Chromium screenshots
  (banner, chart hover at both ends, industries grid, mobile).

### 2026-07-11 — Immersive results band, hero ticker, numbered section system
- **Results section is now a full-bleed dark band** (neutral-950): chart and
  calculator restyled for the dark surface (series colors re-validated for
  dark: emerald #059669 + blue #3B82F6), lines animate drawing themselves in
  on scroll (framer-motion pathLength), end labels fade in after the draw.
- **Ticker below the hero** (`Ticker`): continuously scrolling black band
  with the key numbers/offers as linked items with semantic color dots;
  pauses on hover. Replaces the static benefits strip (deleted).
- **Topbar improved**: a thin progress line refills for each message on the
  5-second rotation and freezes while hovered.
- **Numbered section system** (`SectionHeader`): consistent organizer
  (numbered chip + eyebrow + title + subline) applied across home sections
  01-07; sections reordered for narrative (numbers > best sellers > counter
  story > tech > comparison > industries > custom > scripts) and key
  sections sit on alternating white / neutral-50 / black bands.
- Verified in-browser after killing a stale prod server that was masking the
  new build: ticker scroll, topbar progress, dark chart tooltip, draw-in.

### 2026-07-11 — Interactive topbar + visuals-first results section
- **Topbar rebuilt** (`AnnouncementBar`, now client): messages roll up every
  4 seconds with a spin animation, pause on hover, and are fully interactive:
  prev/next arrows, dot navigation, and each message links somewhere useful.
- **New "What one tap adds up to" section** on home, visuals over words:
  - `GrowthChart`: interactive SVG line chart (cumulative reviews over six
    months, card-on-counter vs just-asking) with crosshair + tooltip on
    hover, legend, direct end labels, and a screen-reader data table.
    Series colors validated with the dataviz palette checker
    (emerald #059669 + blue #2563EB, all checks pass). Data is labelled
    illustrative arithmetic, not measured results.
  - `ReviewCalculator`: two sliders (customers/day, yes-rate) computing
    projected reviews per month and per six months live.
  - Four `CountUp` stat tiles that animate when scrolled into view
    (312 / 20 sec / 98% / $0).
- Verified in-browser: chart hover, slider math, counter animation, topbar
  rotation and controls.

### 2026-07-11 — Design labour fee + navigation consolidated to Home/Products
- **$4.99 design labour fee** when the customer picks Custom > "Design it for
  me" (DESIGN_LABOUR_FEE in products.ts): Standard $34.99, Custom with own
  artwork $42.99, Custom designed by us $47.98. One shared helper
  (`configuredUnitPrice`) drives the configurator UI and the Stripe route so
  displayed and charged prices always match; the fee is labelled on the
  option and in Stripe line items.
- **Navigation trimmed to Home and Products.** The /how-it-works and /contact
  pages were deleted; their content merged into the landing page as a
  4-tile "How tap-to-connect works" strip (id="how-it-works") and a full
  contact section with form (id="contact", new `ContactSection` component).
  Footer links point at the anchors. Legal pages remain (footer only).
- Verified: fee math on the live page ($38.38 pre-order from $47.98), old
  routes 404, anchors scroll correctly.

### 2026-07-11 — Theme: semantic multi-accent on the monotone base
- Replaced the orange-only accent rule with a small semantic palette on the
  same white/black monotone base: orange = brand (logo, Best seller),
  blue = info (cart badge, shipping icons, $0 stat, step labels),
  emerald = money/positive (progress bars, discounts, guarantees, success),
  violet = pre-order identity (all pre-order chips and labels),
  amber = stars/highlight. Color meanings documented in Design system.
- No layout or copy changes. Build clean; verified with screenshots.

### 2026-07-11 — Pricing overhaul: flat $34.99/$42.99 + pre-order 20%, richer content
- **New pricing model:** every product is $34.99 standard, $42.99 custom
  (constants STANDARD_PRICE / CUSTOM_UPCHARGE in `src/lib/products.ts`).
  **Volume/pack discounts removed entirely.** The only discount is the
  **pre-order window** (`site.preorder` in `src/lib/site.ts`): while
  `enabled: true`, 20% comes off every item, shown with strikethrough prices
  everywhere and recomputed server-side for Stripe. Flip `enabled: false`
  when pre-orders end. Order metadata marks pre-order purchases.
- Cart storage key bumped to v2 so carts saved under old prices reset.
- **Richer product content:** every product rewritten with a longer real
  description, a concrete "A real example" story (rendered on the detail
  page), and a "What's in the box" list (new `example` and `box` fields).
- **New home content:** "What to actually say" counter-script section with
  three word-for-word asks, and a cited Sources block (BrightLocal survey,
  Google Maps content policies, Apple NFC background-reading guide).
- **Accuracy fix:** phone-support claims corrected (background NFC reading is
  iPhone XS+; iPhone 7-X need camera/app; QR fallback offered free).
- Configurator shows per-design pricing on the option tiles, pre-order chip,
  strikethrough compare prices, and the pre-order ship note.
- Verified with clean build and screenshots (product, checkout with discount
  line, scripts section).

### 2026-07-10 — Redesign #4: monochrome minimal (replaces warm orange)
- Re-skinned to white/black monotone at the owner's request: pure white page,
  neutral text scale, hairline borders, tight radii (rounded-md max, no
  pills), black primary buttons.
- Orange-600 kept as the single pop color in six deliberate spots (logo, cart
  badge, Best seller badge, shipping progress bars, savings, $0 hero stat).
- Product visuals now render a black card with one small per-product accent
  chip instead of colored gradients. One hero stat tile inverted to black.
- All layout, features, and copy unchanged from Redesign #3.
- Verified with clean build and headless-Chromium screenshots (hero, product
  page, cart drawer).

### 2026-07-10 — Redesign #3: warm & welcoming + conversion essentials (replaces brutalism)
- Softened the brutalist theme at the owner's request: rounded cards, soft
  shadows, cream background, friendly orange accent, pastel bento tiles,
  Plus Jakarta Sans + Inter, sentence-case copy. Marquee removed.
- **Added standard e-commerce conversion features:** slide-out cart drawer
  with free-shipping progress bar (opens on add-to-cart), delivery date
  estimate on product pages, payment method badges, newsletter block with
  10% first-order incentive, benefits strip, `allow_promotion_codes` enabled
  in Stripe checkout.
- Product accent colors warmed; drawer state added to CartContext.
- Verified with clean build and headless-Chromium screenshots (hero, product
  page, open cart drawer).

### 2026-07-10 — Redesign #2: minimal neubrutalism + bento grids (replaces light premium)
- Full re-theme at the owner's request, grounded in researched neobrutalism
  patterns (NN/g, neubrutalism.com): 2px black borders, hard offset shadows
  (`shadow-brutal`, no blur), flat color tiles (yolk/bubble/mint/sky on cream),
  sharp corners, uppercase Archivo Black headlines, Space Grotesk body,
  Space Mono labels.
- **Bento-grid hero** (main tile, photo tile, 4 colored stat tiles) and a
  mixed-size **industries photo bento**. Added a scrolling `Marquee` strip.
- New `.box` / `.box-hover` / `.tag` utilities in `globals.css`; press-down
  button interaction (translate + shadow collapse).
- **Copy sweep:** removed em dashes and AI-sounding phrasing from all
  customer-facing text (home, product catalog, legal pages, Stripe line-item
  labels). Product catalog descriptions rewritten in plain counter language.
- Product accent colors switched from gradients to the flat brutalist palette.
- Verified with clean build and headless-Chromium screenshots (bento hero,
  comparison table, product page).

### 2026-07-10 — Complete redesign: light premium theme (replaces dark neon)
- **The dark violet/cyan "cinematic" theme is gone** at the owner's request.
  New design language: white + warm `paper` (#f7f6f3) surfaces, slate text,
  a single blue-600 accent, near-black primary buttons, soft card shadows,
  dark slate-950 footer/CTA panels for contrast. Think premium Shopify/Apple
  store rather than neon SaaS.
- Display font switched Sora → **Bricolage Grotesque** (body stays Inter).
- Every component and page restyled: navbar, footer, buttons, announcement
  bar, product cards/grid/visuals, configurator, checkout, contact,
  how-it-works, legal pages, 404. Hero and custom-design banner keep photo
  backgrounds with dark overlays (white text there is intentional).
- `tailwind.config.ts` rewritten: removed `ink`/`brand`/`cyanx` palettes,
  glows, and gradient utilities; added `paper` color + `shadow-card(-hover)`.
- Verified visually with headless-Chromium screenshots (hero, light sections,
  product page) plus clean build and API smoke test.

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
