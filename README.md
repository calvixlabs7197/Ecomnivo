# EcomNivo

**Smart Tools for Smarter E-commerce** — free calculators for profitability, advertising, pricing and growth.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4. Supabase arrives in Phase 4.

Full design and build plan: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Getting started

**Requirements:** Node.js 20.9+ (developed on 24.x) and npm.

```bash
# 1. install dependencies
npm install

# 2. create your local environment file
cp .env.example .env.local

# 3. run the dev server
npm run dev
```

Open <http://localhost:3000>.

`.env.local` needs exactly one variable for now:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

This is not optional. Every canonical URL, Open Graph tag and sitemap entry is built from it, so the app validates it at startup and **fails loudly** if it is missing or is not an absolute URL. That is deliberate — a wrong value would silently poison the site's SEO rather than throwing.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also runs TypeScript) |
| `npm start` | Serve the production build — run `build` first |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest — calculator formulas and engine invariants |
| `npm run test:watch` | Vitest in watch mode |

Before committing, all four of `test`, `build`, `typecheck` and `lint` must pass.

> `typecheck` reads generated route types, so after adding or renaming a route run `npm run build` once before `npm run typecheck` — otherwise it reports unknown-route errors for pages that are perfectly fine.

## Project layout

```
app/            routes, metadata files (sitemap, robots, OG images)
components/     ui/ primitives · layout/ shell · tools/ · categories/ · seo/ · home/ · monetization/
config/         site, categories, FAQs, validated env
lib/            seo/ (metadata + JSON-LD) · tools/ (catalog, types) · utils
docs/           architecture and build plan
```

Two rules worth knowing before you add code:

1. **No page hand-writes its own `<title>` or canonical.** Use `buildMetadata()` from `lib/seo/metadata.ts`. This is the only thing keeping titles, canonicals, OG tags and the sitemap consistent.
2. **A tool's maths will live in code, never in the database.** From Phase 2, each calculator is a pure, unit-tested function in `lib/tools/definitions/`. The database only ever stores the editable content and SEO shell around it. See ARCHITECTURE.md §0, decision 1.

## Current status — Phase 4 complete

> **Before this goes public:** set `siteConfig.contactEmail` in [config/site.ts](config/site.ts). The legal pages currently render a "contact details are not yet published" notice because a privacy policy must name a way to reach the data controller. Setting it updates every legal page at once.



**Phase 1** — design system, layout shell, homepage, `/tools`, `/categories`, `/categories/[slug]`, `/guides`, `/about`, 404, and the SEO foundation (metadata factory, canonicals, per-segment OG images, sitemap, robots, structured data).

**Phase 2** — the tool engine, the client island, and the first five calculators.

**Phase 3** — the remaining seventeen. Every tool in the catalog now has its own page, its own prerendered OG card, and its own tests.

| Category | Tools |
|---|---|
| Advertising | ROAS, Break-Even ROAS, CPC, CPM, CTR, CPA, CAC, Ad Budget |
| Profitability | E-commerce Profit, Shopify Profit, Product Profit, Profit Margin, Gross Profit, Net Profit |
| Pricing | Markup, Selling Price, Discount, Wholesale Pricing |
| Growth | Conversion Rate, AOV, Revenue, Customer LTV |

**Phase 4** — content and search: 3 guides at `/guides`, `/about`, `/faq`, five legal pages, and `/search` across tools, guides and categories. The Supabase schema, RLS policies and auth hooks are written in [supabase/migrations/](supabase/migrations/) but **not yet applied** — there is no project to apply them to.

**Phase 7** — analytics, advertising and affiliate architecture. All three are **inert until configured**, and analytics additionally requires visitor consent. Phases 5 and 6 (auth, admin) were skipped by decision because both need Supabase.

340 tests. **Next: Phase 8 — the security, SEO, performance and accessibility audits.**

### The admin panel

```bash
# .env.local — admin is disabled entirely unless BOTH are set
ADMIN_PASSWORD=at-least-twelve-characters
AUTH_SECRET=$(openssl rand -hex 32)
```

Then sign in at `/login`. Admin lives at `/admin`.

| Screen | What you can do |
|---|---|
| Dashboard | Counts, and the audit log |
| Tools | Name, description, SEO title/description, category, publish, feature, sort order, related tools |
| Guides | Full CRUD — Markdown body, draft / scheduled / published, SEO, indexability, related tools |
| Pages | Edit the built-in pages **and create entirely new ones** at any URL |
| Settings | Site name, tagline, description, contact email, SEO defaults, GA4 and ad client IDs |
| Activity | Append-only log of every change |

Changes are live immediately — saving revalidates the affected pages, and new pages and guides are served by dynamic route params, so there is no rebuild between saving and seeing it.

**Two things it deliberately cannot do.** It cannot create or edit a *calculator's formula* — see the note below. And it writes to `data/*.json` on disk, which means **content editing does not work on serverless hosting** (Vercel's filesystem is read-only). Locally it works fully; production needs the Supabase implementation of the same repository interface.

Delete `data/` at any time to reset everything back to the built-in content.

### Turning analytics on

```bash
# .env.local — analytics stays completely off without this
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

With no ID: no consent banner, no script request, no `gtag`. With an ID: a banner appears once, and **nothing is requested until the visitor accepts** — declining is remembered and loads nothing.

Events live in [lib/analytics/events.ts](lib/analytics/events.ts) as a closed union, so a typo is a compile error rather than a metric that silently never arrives. **No calculator input is ever sent** — only that a calculation happened and which tool it was.

Advertising works the same way via `NEXT_PUBLIC_AD_CLIENT_ID`, and also requires consent.

> Building needs roughly 1.5–2 GB of free memory. Below that the static-generation workers are killed by the OS. `experimental.cpus` in [next.config.ts](next.config.ts) caps the pool.

### How content works today

Guides and pages are file-backed, behind the interface the database will use:

```
content/guides/<slug>.ts     a guide: front-matter fields + markdown body
content/pages/*.ts           about, and the five legal pages
lib/content/guides.ts        listGuides() / getGuide() / getGuidesForTool()
lib/content/pages.ts         getPage() / listPages()
```

Phase 5 replaces the bodies of those functions with Supabase queries. Nothing that calls them changes — and the file source stays as the fallback, because the site must render when the database is empty or unreachable ([ARCHITECTURE.md](docs/ARCHITECTURE.md) §0, decision 2).

**A guide declares the tools it explains**, and tool pages read that relationship backwards. Do not add a matching list on the tool — the two would drift.

### How a tool is put together

Each calculator is two modules, and the split matters:

```
lib/tools/engines/<slug>.ts    fields + compute   -> imported by the client island
lib/tools/content/<slug>.ts    the page's prose   -> server-rendered only
lib/tools/registry.ts          pairs them, and fails the build if they disagree
```

`compute` must be **pure and total** — no I/O, no clock, and it must never throw. A zero denominator returns `{ value: null, note }`, never `NaN` or `Infinity`. That rule is enforced by `tests/tools/engine-invariants.test.ts` against every engine, so a new calculator inherits the coverage.

### Adding a calculator

1. Write `lib/tools/engines/<slug>.ts` — derive the formula **by hand first** and check it against [Appendix A](docs/ARCHITECTURE.md).
2. Write `lib/tools/content/<slug>.ts` — formula, worked example, interpretation, common mistakes, 3+ FAQs, 2+ related tools.
3. Register both in `lib/tools/engines/index.ts` and `lib/tools/registry.ts`.
4. Flip the catalog entry to `status: "live"`.
5. Write `tests/tools/<slug>.test.ts` asserting the hand-derived numbers — **not whatever the code returns**.

The registry refuses to build if a live tool is missing an engine, missing content, has fewer than three FAQs, has a worked example whose keys do not match its fields, or links to a tool that does not exist.

Verified formulas for all 22 tools are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) Appendix A. Those are the values the tests assert.

> **Step 1 is not optional, and here is why.** Appendix A #10 (Shopify Profit) said $5,461. Re-deriving it by hand in Phase 3 gave $5,511 — a $50 error sitting in the reference table. If the engine had been written from the appendix and the test written from the engine, both would have agreed with each other and been wrong together. Derive the number yourself, assert *that*, and never write a test that asserts whatever the code happens to return.
