# EcomNivo — Architecture & Build Plan

*Smart Tools for Smarter E-commerce*

**Status:** Approved. **Phases 1–4 and 7 complete** — 22 calculators, 3 guides, all legal pages, site search, and consent-gated analytics/ads/affiliate architecture. Phases 5–6 (auth, admin) deferred by decision until Supabase is introduced. See §10–§14 for what was actually built and where it deviated from this plan.
**Date:** 2026-08-12

---

## 0. The ten decisions that shape everything

Read this section first. Everything below is a consequence of these.

| # | Decision | Why |
|---|---|---|
| 1 | **Calculators are code, not database rows.** The math lives in typed, unit-tested TypeScript. The database stores only the *editable content and SEO shell* around each tool. | You cannot store a formula in a table and execute it safely. A DB-driven "tool builder" would force `eval()`, untestable math, and a security hole. |
| 2 | **A tool renders even if the database is empty.** Code defaults are the source of truth; DB rows are optional overrides merged on top. | The site is never broken by a bad migration, an unseeded table, or a Supabase outage. Phase 2 ships working tools before Phase 5 auth exists. |
| 3 | **Calculation runs in the browser, not on the server.** Tool pages are Server Components that render one small client island. | Instant results, zero network latency, zero server cost, and the page itself stays statically cached for SEO. |
| 4 | **Currency is formatting, not conversion.** We format in USD/GBP/EUR/CAD/AUD. We never convert between them. | Every calculator here is unit-agnostic (ratios and same-currency arithmetic). Adding FX rates would introduce stale data and wrong answers for zero benefit. |
| 5 | **Admin security is three independent layers**, not one: middleware redirect → server-side role check → Postgres RLS. | Any single layer failing must not expose data. Middleware alone is cosmetic. |
| 6 | **The role lives in the JWT**, injected by a Supabase custom access token hook, not read from a table inside RLS policies. | Avoids infinite recursion in `profiles` policies and a table lookup on every row check. |
| 7 | **Nothing secret goes in the database.** `site_settings` holds only values that are already public in the browser (GA4 ID, social URLs). Secrets stay in environment variables. | `site_settings` is publicly readable by design. Treating it as a secret store is how keys leak. |
| 8 | **Guides are Markdown in Postgres, rendered and sanitized on the server.** Not MDX files, not raw HTML. | Admin-editable (a hard requirement), no rebuild to publish, no arbitrary-HTML XSS vector. |
| 9 | **Light theme only in v1**, but every colour is a CSS variable from day one. | Dark mode is a token swap later, not a refactor. Shipping it now doubles the QA surface for no launch value. |
| 10 | **Ads and affiliate links are architecture in Phase 1, content in Phase 7.** `<AdSlot />` and `<AffiliateLink />` exist and render nothing until configured. | Retrofitting ad slots into a finished layout causes CLS. Placeholders that reserve space do not. |

---

## 1. System architecture

### 1.1 Runtime shape

```
                        ┌──────────────────────────────┐
   Visitor ────────────▶│  Vercel Edge (middleware)    │
                        │  · session refresh           │
                        │  · /admin gate (layer 1)     │
                        └──────────────┬───────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │ STATIC (ISR)       │  │ DYNAMIC            │  │ ROUTE HANDLERS     │
   │ /                  │  │ /admin/**          │  │ /api/revalidate    │
   │ /tools, /tools/*   │  │ /account, /dash    │  │ /api/contact       │
   │ /categories/*      │  │ /search            │  │ /api/track         │
   │ /guides, /guides/* │  │                    │  │                    │
   │ legal pages        │  │ role check layer 2 │  │ zod-validated      │
   └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘
             │                       │                        │
             └───────────────────────┴────────────────────────┘
                                     ▼
                        ┌──────────────────────────────┐
                        │  Supabase (Postgres + Auth)  │
                        │  RLS enforced (layer 3)      │
                        └──────────────────────────────┘

   Tool math never touches this diagram — it runs in the visitor's browser.
```

### 1.2 The hybrid tool registry

This is the core pattern of the codebase.

```ts
// lib/tools/types.ts

export type CategorySlug = 'advertising' | 'profitability' | 'pricing' | 'growth';
export type FieldKind = 'currency' | 'number' | 'percent' | 'integer';
export type ResultFormat = 'currency' | 'percent' | 'ratio' | 'number';

export interface ToolField {
  name: string;                 // key into the input record
  label: string;                // visible <label>, never placeholder-only
  kind: FieldKind;
  help?: string;                // one line under the input
  min?: number;
  max?: number;
  required?: boolean;           // default true
  defaultValue?: number;
}

export interface ToolResult {
  key: string;
  label: string;
  value: number | null;         // null = undefined for these inputs (e.g. ÷ 0)
  format: ResultFormat;
  emphasis?: 'primary' | 'secondary';
  tone?: 'neutral' | 'positive' | 'negative';
  note?: string;                // shown when value is null, or to qualify it
}

export interface ToolDefinition<I extends Record<string, number> = Record<string, number>> {
  slug: string;                 // 'roas-calculator' → /tools/roas-calculator
  name: string;                 // 'ROAS Calculator'
  h1: string;
  category: CategorySlug;
  status: 'live' | 'planned';   // 'planned' never renders a route

  shortDescription: string;     // cards + meta description fallback
  intro: string;                // 2–3 sentences above the calculator

  fields: ToolField[];
  compute: (input: I) => ToolResult[];      // PURE. no I/O, no Date.now(), no throw

  formula: { expression: string; explanation: string };
  example: { inputs: I; narrative: string };
  interpretation: string[];
  commonMistakes: string[];
  faqs: Array<{ q: string; a: string }>;

  relatedTools: string[];       // slugs
  relatedGuides: string[];      // slugs
  seo: { title: string; description: string };
}
```

**Rules enforced by review and tests:**

- `compute` is pure and total. It **never throws** — a divide-by-zero returns `{ value: null, note: '…' }`. A calculator that crashes on `0` impressions is the single most common bug in this category of site.
- Every `compute` has a unit test whose expected values were derived by hand, not by running the code (see §9, Phase 2 acceptance).
- `example.inputs` is type-checked against `I`, so a documented worked example can never drift from the real formula.

**Merging code with the database:**

```ts
// lib/tools/resolve.ts  (server-only)
const def  = getToolDefinition(slug);           // code — required
const row  = await getToolRow(slug);            // DB  — optional, may be null

return {
  ...def,
  name:            row?.name             ?? def.name,
  shortDescription:row?.short_description?? def.shortDescription,
  seo: {
    title:       row?.seo_title       ?? def.seo.title,
    description: row?.seo_description ?? def.seo.description,
  },
  published: row?.is_published ?? true,   // no row = published (code default)
};
```

Admin edits the shell. Nobody edits the math from a browser.

### 1.3 Caching and revalidation

| Surface | Strategy |
|---|---|
| Tool pages, category pages, home | `generateStaticParams` + ISR, tagged `tool:<slug>`, `tools` |
| Guides | ISR, tagged `guide:<slug>`, `guides` |
| Legal/about pages | ISR, tagged `page:<slug>` |
| Admin | `export const dynamic = 'force-dynamic'`, `revalidate = 0` |
| Search | client-side over a static JSON index built from the registry + published guides |

Admin server actions call `revalidateTag()` on save, so publishing is live in seconds without a redeploy.

---

## 2. Folder structure

```
ecomnivo/
├── app/
│   ├── layout.tsx                     # <html>, Inter, header/footer, Organization+WebSite JSON-LD
│   ├── page.tsx                       # homepage
│   ├── globals.css                    # Tailwind v4 @theme tokens
│   ├── not-found.tsx                  # 404
│   ├── error.tsx  |  loading.tsx
│   ├── sitemap.ts  |  robots.ts
│   ├── opengraph-image.tsx            # default OG card
│   │
│   ├── tools/
│   │   ├── page.tsx                   # /tools — full index, grouped by category
│   │   └── [slug]/
│   │       ├── page.tsx               # generateStaticParams + generateMetadata
│   │       └── opengraph-image.tsx    # per-tool OG card (next/og)
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── guides/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── search/page.tsx
│   ├── (legal)/
│   │   ├── privacy-policy/page.tsx    # all render from `pages` table
│   │   ├── terms/page.tsx
│   │   ├── disclaimer/page.tsx
│   │   ├── editorial-policy/page.tsx
│   │   └── affiliate-disclosure/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── auth/callback/route.ts
│   │
│   ├── admin/
│   │   ├── layout.tsx                 # ← AUTHORITATIVE role gate (layer 2)
│   │   ├── page.tsx                   # dashboard
│   │   ├── tools/                     # list | [id]/edit
│   │   ├── guides/                    # list | new | [id]/edit
│   │   ├── pages/  categories/  faqs/
│   │   ├── messages/                  # contact inbox
│   │   ├── users/                     # role management (super_admin only)
│   │   ├── settings/
│   │   └── activity/                  # audit log
│   │
│   └── api/
│       ├── contact/route.ts
│       ├── track/route.ts             # tool_usage beacon, no PII
│       └── revalidate/route.ts        # secret-guarded
│
├── components/
│   ├── ui/                            # Button Input Select Card Badge Alert Tabs Skeleton …
│   ├── layout/                        # Header MobileNav Footer Container Breadcrumbs
│   ├── tools/
│   │   ├── ToolPage.tsx               # server: the whole tool page template
│   │   ├── ToolRunner.tsx             # 'use client' — the ONLY interactive island
│   │   ├── ToolFieldInput.tsx
│   │   ├── ToolResults.tsx
│   │   ├── ToolFormula.tsx  ToolExample.tsx  ToolFaq.tsx
│   │   ├── ToolCard.tsx  ToolGrid.tsx
│   │   └── CurrencySelect.tsx
│   ├── content/                       # Markdown (sanitized), Prose, TableOfContents
│   ├── seo/                           # JsonLd.tsx
│   ├── monetization/                  # AdSlot.tsx  AffiliateLink.tsx
│   ├── search/                        # SearchDialog, SearchResults
│   └── admin/                         # DataTable, MarkdownEditor, SeoFields, StatusBadge…
│
├── lib/
│   ├── tools/
│   │   ├── types.ts
│   │   ├── registry.ts                # slug → ToolDefinition (the index)
│   │   ├── resolve.ts                 # code + DB merge (server-only)
│   │   ├── format.ts                  # Intl formatting, currency + percent
│   │   ├── math.ts                    # safeDivide, round, pct helpers
│   │   └── definitions/
│   │       ├── advertising/roas-calculator.ts   # …one file per tool
│   │       ├── profitability/…
│   │       ├── pricing/…
│   │       └── growth/…
│   ├── supabase/
│   │   ├── client.ts                  # browser client
│   │   ├── server.ts                  # RSC / server-action client (cookies)
│   │   ├── middleware.ts              # session refresh helper
│   │   └── admin.ts                   # service-role — 'server-only', 1 use case
│   ├── auth/
│   │   ├── session.ts                 # getUser(), getProfile()
│   │   └── guards.ts                  # requireRole('admin') → redirect|throw
│   ├── seo/
│   │   ├── metadata.ts                # buildMetadata()
│   │   ├── jsonld.ts                  # schema builders
│   │   └── breadcrumbs.ts
│   ├── content/
│   │   ├── markdown.ts                # render + sanitize pipeline
│   │   └── reading-time.ts
│   ├── analytics/events.ts            # typed event names, single trackEvent()
│   ├── validation/                    # zod schemas, shared client+server
│   ├── rate-limit.ts
│   └── utils.ts                       # cn(), slugify()
│
├── actions/                           # 'use server' — admin CRUD, contact, revalidate
├── hooks/                             # useToolState, useCurrency, useCopyToClipboard
├── types/                             # database.types.ts (generated), shared types
├── config/                            # site.ts, navigation.ts, categories.ts, currencies.ts
├── supabase/migrations/               # numbered .sql, checked in
├── tests/tools/                       # vitest — one spec per calculator
├── docs/                              # this file + runbooks
└── public/
```

**Rule:** `lib/tools/definitions/*` files import nothing from `app/`, `components/`, or Supabase. They are portable, testable data + pure functions.

---

## 3. Dependencies

Latest published versions verified on 2026-08-12. `create-next-app` will pin a mutually-compatible set — let it, then reconcile.

### Runtime (production)

| Package | Version | Why it earns its place |
|---|---|---|
| `next` | 16.3.0 | Framework |
| `react` / `react-dom` | 19.2.8 | Framework |
| `@supabase/supabase-js` | 2.112.3 | DB + auth client |
| `@supabase/ssr` | 0.12.4 | Cookie-based sessions for App Router — **required**, not optional |
| `zod` | 4.4.3 | One schema shared by client form, server action, and API route |
| `react-markdown` | 10.1.0 | Renders guide Markdown **in a Server Component** → 0 KB client JS |
| `remark-gfm` | 4.0.1 | Tables, strikethrough, autolinks in guides |
| `rehype-sanitize` | 6.0.0 | XSS defence on admin-authored content. Non-negotiable |
| `lucide-react` | 1.31.0 | Icons, tree-shaken per-icon. Used sparingly (§6) |
| `clsx` + `tailwind-merge` | latest | `cn()` helper |

### Dev

| Package | Version | Why |
|---|---|---|
| `typescript` | 7.0.2 (or whatever CLI pins) | Strict mode, `noUncheckedIndexedAccess` |
| `tailwindcss` | 4.3.3 | CSS-first config via `@theme` |
| `vitest` | 4.1.10 | Calculator unit tests |
| `eslint` + `eslint-config-next` | via CLI | Lint |
| `prettier` + `prettier-plugin-tailwindcss` | latest | Class ordering |
| `supabase` CLI | latest | Migrations, type generation |

### Deliberately NOT installed

`next-auth` (Supabase Auth covers it) · `prisma`/`drizzle` (supabase-js + generated types is enough at this scale) · any UI kit (MUI/Chakra/shadcn-as-dependency) · `framer-motion` (CSS transitions cover §6's motion budget) · `date-fns`/`moment` (`Intl.DateTimeFormat`) · any charting library until a tool actually needs one · `axios` · `lodash`.

Every future addition needs a one-line justification in the PR. This is how the JS budget stays small.

---

## 4. Supabase architecture

### 4.1 Schema

14 tables. Everything uses `uuid` PKs (`gen_random_uuid()`), `created_at`/`updated_at timestamptz`, and RLS **enabled with no permissive default**.

```sql
create type app_role      as enum ('user','editor','admin','super_admin');
create type content_status as enum ('draft','scheduled','published');

-- identity ------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        app_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- tools: SEO/content shell only. math is in lib/tools/definitions/* ----------
create table tool_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null,
  description text, sort_order int not null default 0,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                       -- MUST match a registry slug
  category_id uuid references tool_categories(id) on delete set null,
  name text, short_description text,
  seo_title text, seo_description text,
  is_published boolean not null default true,
  is_featured  boolean not null default false,     -- drives "Popular Tools"
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on tools (category_id, sort_order);
create index on tools (is_featured) where is_published;

create table tool_related (
  tool_id uuid references tools(id) on delete cascade,
  related_tool_id uuid references tools(id) on delete cascade,
  sort_order int not null default 0,
  primary key (tool_id, related_tool_id),
  check (tool_id <> related_tool_id)
);

-- content -------------------------------------------------------------------
create table authors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  slug text unique not null, name text not null,
  bio text, avatar_url text, links jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table guide_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text,
  sort_order int not null default 0
);

create table guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null, excerpt text, content_md text not null default '',
  featured_image_url text, featured_image_alt text,
  author_id   uuid references authors(id) on delete set null,
  category_id uuid references guide_categories(id) on delete set null,
  status content_status not null default 'draft',
  published_at timestamptz,
  seo_title text, seo_description text, canonical_url text,
  is_indexable boolean not null default true,
  reading_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on guides (status, published_at desc);

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null
);
create table guide_tags (
  guide_id uuid references guides(id) on delete cascade,
  tag_id   uuid references tags(id)   on delete cascade,
  primary key (guide_id, tag_id)
);

-- editable static pages: about, contact, faq, all legal ---------------------
create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, content_md text not null default '',
  seo_title text, seo_description text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table faq_items (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('site','tool','guide')),
  scope_ref text,                                   -- slug when scope <> 'site'
  question text not null, answer_md text not null,
  sort_order int not null default 0,
  is_published boolean not null default true
);
create index on faq_items (scope, scope_ref);

-- operations ----------------------------------------------------------------
create table site_settings (                        -- exactly one row, PUBLIC
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'EcomNivo',
  logo_url text, favicon_url text,
  default_seo_title text, default_seo_description text,
  social_links jsonb not null default '{}',
  ga4_measurement_id text, ad_client_id text,       -- public-by-nature only
  contact_email text,
  updated_at timestamptz not null default now()
);

create table tool_usage (                           -- aggregate only, NO PII
  id bigserial primary key,
  tool_slug text not null,
  event text not null check (event in ('view','calculate','copy','reset')),
  currency text, country text,
  created_at timestamptz not null default now()
);
create index on tool_usage (tool_slug, created_at desc);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null,
  subject text, message text not null,
  ip_hash text,                                     -- sha256(ip + salt), never raw IP
  status text not null default 'new' check (status in ('new','read','archived','spam')),
  created_at timestamptz not null default now()
);
create index on contact_messages (ip_hash, created_at desc);

create table admin_activity_logs (
  id bigserial primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,                             -- 'guide.publish'
  entity_type text, entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

`affiliate_links` is added in Phase 7, not now — no table before there is a link to put in it.

### 4.2 Roles in the JWT (the important part)

Naive RLS reads `profiles.role` inside a `profiles` policy → infinite recursion. Fix: a **custom access token hook** stamps the role into the JWT at login.

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare claims jsonb; user_role public.app_role;
begin
  select role into user_role from public.profiles where id = (event->>'user_id')::uuid;
  claims := coalesce(event->'claims','{}'::jsonb);
  claims := jsonb_set(claims, '{app_metadata,user_role}',
                      to_jsonb(coalesce(user_role,'user'::public.app_role)));
  return jsonb_set(event, '{claims}', claims);
end $$;

create or replace function public.jwt_role() returns text
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'user_role', 'anon')
$$;

create or replace function public.is_staff() returns boolean
language sql stable as $$ select public.jwt_role() in ('editor','admin','super_admin') $$;

create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.jwt_role() in ('admin','super_admin') $$;
```

A role change takes effect on the user's next token refresh (≤ 1 hour). Acceptable; documented in the admin UI when changing a role.

### 4.3 RLS policy model

| Table | anon / user | editor | admin / super_admin |
|---|---|---|---|
| `tools`, `tool_categories`, `tool_related` | select where published | select | all |
| `guides` | select where `status='published' and published_at <= now()` | all | all |
| `guide_categories`, `tags`, `guide_tags`, `authors` | select | all | all |
| `pages`, `faq_items` | select where published | all | all |
| `site_settings` | select | select | update |
| `profiles` | select/update **own row only** | select own | select all; update all |
| `tool_usage` | **insert only** | — | select |
| `contact_messages` | **insert only** | — | select, update status |
| `admin_activity_logs` | — | — | select (insert via trigger only) |

Representative policies:

```sql
alter table guides enable row level security;

create policy "guides: public reads published" on guides for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "guides: staff full access" on guides for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

alter table profiles enable row level security;
create policy "profiles: read own"  on profiles for select to authenticated using (id = auth.uid());
create policy "profiles: read all (admin)" on profiles for select to authenticated using (public.is_admin());
create policy "profiles: update own" on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
```

**Privilege-escalation guard.** "Update own row" would otherwise let a user set `role = 'super_admin'`. RLS cannot express "all columns except this one", so a trigger does it:

```sql
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and public.jwt_role() <> 'super_admin' then
    raise exception 'insufficient privilege: role changes require super_admin';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on profiles
  for each row execute function public.guard_role_change();
```

The first super_admin is promoted by a one-off SQL statement in the Supabase dashboard, recorded in `docs/RUNBOOK.md`. **No credentials or role assignments in the codebase.**

### 4.4 Key handling

| Key | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public by design; **RLS is what protects the data** |
| `SUPABASE_SERVICE_ROLE_KEY` | server only, `lib/supabase/admin.ts` with `import 'server-only'` | Bypasses RLS. Used *only* for the contact-form insert path if rate-limit bookkeeping needs it. If Phase 6 ends without needing it, the file is deleted. |

CI check: grep the client bundle for the service-role prefix and fail the build on a hit.

---

## 5. SEO architecture

### 5.1 Metadata

One factory, used by every page. No page hand-rolls a `<title>`.

```ts
// lib/seo/metadata.ts
export function buildMetadata({
  title, description, path, image, noindex = false, type = 'website',
  publishedTime, modifiedTime,
}: BuildMetadataArgs): Metadata {
  const url = new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();  // absolute, query-free
  return {
    title, description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large',
                       'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type, url, title, description, siteName: 'EcomNivo',
                 locale: 'en_US', images: [image ?? defaultOg(path)],
                 publishedTime, modifiedTime },
    twitter: { card: 'summary_large_image', title, description,
               images: [image ?? defaultOg(path)] },
  };
}
```

- Title pattern: `{Page Title} | EcomNivo` — except the homepage, which is `EcomNivo — Smart Tools for Smarter E-commerce`.
- Root `metadataBase` set once in `app/layout.tsx`.
- OG images generated at request time by `next/og` per tool and per guide — no design files, no external hosting, correct 1200×630.

### 5.2 Structured data

`lib/seo/jsonld.ts` exports builders; a `<JsonLd data={…} />` component emits the script tag.

| Schema | Where | Note |
|---|---|---|
| `Organization` | root layout | Once, sitewide |
| `WebSite` + `SearchAction` | root layout | Points at `/search?q={search_term_string}` |
| `BreadcrumbList` | every page below root | Must mirror the visible breadcrumb exactly |
| `WebApplication` | tool pages | `applicationCategory: BusinessApplication`, `offers: price 0` — this is the honest type for a free calculator |
| `Article` | guide pages | Real `author`, `datePublished`, `dateModified` |
| `FAQPage` | tool + `/faq` pages | Only where a genuine Q&A is **visible on the page** |

Honest caveat on `FAQPage`: since Google's 2023 change, FAQ rich results are shown almost exclusively for authoritative government/health sites. We mark it up because it is valid and machine-readable — **not** because it will produce rich snippets. Nobody should plan traffic around it.

### 5.3 Crawl control

```ts
// app/robots.ts
rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/account', '/dashboard', '/search'] }]
sitemap: `${SITE_URL}/sitemap.xml`
```

`app/sitemap.ts` builds from the registry (live tools) + published DB rows (guides, categories, pages), with `lastModified` from `updated_at` and honest `priority` values. Drafts, `is_indexable = false`, and `/search` never appear.

### 5.4 Indexation discipline

The brief forbids doorway pages, and the plan enforces it structurally:

- **No** `/usa/roas-calculator` style geo-pages. Currency is a UI control on one canonical page, not 5 duplicate URLs.
- **No** `/tools/roas-calculator-free`, `-online`, `-2026` keyword variants.
- `/search` and any filtered listing: `noindex, follow`.
- A tool page is only routable when `status: 'live'` **and** it has a formula, worked example, interpretation, ≥3 FAQs, and ≥2 related links. `'planned'` tools 404 rather than shipping a thin page.

### 5.5 Internal linking

Every tool page links: parent category → 3–4 sibling tools → 1–2 guides. Every guide links to at least one tool it references. Category hubs link to every tool they contain. This produces a dense, crawlable graph without a link farm.

### 5.6 Core Web Vitals plan

| Metric | Approach |
|---|---|
| LCP | Hero is text on a static page. `next/font` with `display: swap` + preload. No hero image, no carousel. |
| CLS | Ad slots reserve fixed height from first paint. Results panel reserves its height before calculation. All images have explicit dimensions. |
| INP | One client island per tool page. Calculation is O(1) arithmetic on `onChange`, no debounce needed, no re-render of the server-rendered content. |
| TTFB | ISR/static for every indexable route. |

---

## 6. Design system

### 6.1 Tokens (Tailwind v4, CSS-first)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg:            #FFFFFF;
  --color-surface:       #F9FAFB;
  --color-text:          #111827;
  --color-text-muted:    #6B7280;
  --color-border:        #E5E7EB;
  --color-border-strong: #D1D5DB;

  --color-primary:       #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-soft:  #EFF6FF;

  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-error:   #DC2626;

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 6px;  --radius-md: 8px;  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(17 24 39 / 0.05);
  --shadow-md: 0 4px 12px -2px rgb(17 24 39 / 0.08);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Two shadows. Three radii. That is the whole inventory — the restraint is the design.

### 6.2 Typography

Inter only, via `next/font/google` (variable, `latin` subset, `display: swap`, self-hosted by Next — no Google Fonts request at runtime).

| Role | Size / line-height | Weight |
|---|---|---|
| Display (hero H1) | 48 / 1.1 → 36 mobile | 700 |
| H1 | 36 / 1.2 → 30 mobile | 700 |
| H2 | 28 / 1.3 | 600 |
| H3 | 20 / 1.4 | 600 |
| Body | 16 / 1.65 | 400 |
| Small / help | 14 / 1.5 | 400 |
| Label / eyebrow | 13 / 1.4, `tracking-wide` | 500 |
| Numeric result | 32–40, `tabular-nums` | 700 |

`tabular-nums` on every result and table figure so numbers don't jitter as they update — small detail, big perceived-quality difference on a calculator site.

### 6.3 Spacing & layout

4px base scale. Container `max-w-[1200px]`, prose `max-w-[68ch]`. Section rhythm: 64px mobile / 96px desktop. Breakpoints: 640 / 768 / 1024 / 1280.

### 6.4 Motion budget

Transitions on `opacity`, `transform`, `background-color`, `border-color` only. 150ms (hover/focus) or 200ms (enter). `--ease-out`. Everything wrapped in `@media (prefers-reduced-motion: reduce)` handling. **No** scroll-triggered animation, parallax, count-up number animation, or animated gradients.

### 6.5 Component inventory (v1)

`Button` (primary/secondary/ghost × sm/md/lg) · `Input` · `NumberInput` (with currency/percent affix) · `Select` · `Textarea` · `Card` · `Badge` · `Alert` · `Breadcrumbs` · `Tabs` · `Accordion` (FAQ) · `Skeleton` · `EmptyState` · `Pagination` · `CopyButton`.

Built in-house on Tailwind — ~15 small files, zero dependencies, total control over a11y and bundle size.

### 6.6 Accessibility baseline

Semantic landmarks (`header`/`nav`/`main`/`footer`/`article`) · exactly one `h1` per page, no level skips · visible `:focus-visible` ring (2px primary + 2px offset) on every interactive element · every input has a real `<label>`, never placeholder-as-label · errors linked via `aria-describedby` + `aria-invalid` · results region is `aria-live="polite"` so screen readers hear updated values · mobile nav is a proper focus-trapped dialog with Escape-to-close · 4.5:1 contrast minimum (the given palette passes on white: `#6B7280` = 4.83:1, `#2563EB` = 5.17:1) · full keyboard operability, no mouse-only paths.

---

## 7. Homepage wireframe

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  EcomNivo      Tools  Categories  Guides   [🔍]  About  [Explore ▸]  │  sticky, 64px
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              Smart Tools for Smarter E-commerce                      │  48/700, centered
│                                                                      │
│     Free calculators and tools to help you understand profitability, │  18/1.6 muted, 60ch
│     advertising performance, pricing, fees, and growth.              │
│                                                                      │
│            [  Explore Tools  ]   [  Browse Guides  ]                 │  primary + secondary
│                                                                      │
│         22 free tools  ·  No signup  ·  No limits                    │  13/500 muted
├──────────────────────────────────────────────────────────────────────┤
│  POPULAR TOOLS                                    View all tools →   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                        │
│  │ ROAS Calc  │ │ Ecom Profit│ │ Profit     │   3 × 2 grid           │
│  │ Measure ad │ │ True profit│ │ Margin     │   card: title,         │
│  │ return…    │ │ per order… │ │ …          │   1-line desc,         │
│  │ Advertising│ │ Profitabil.│ │ Pricing    │   category badge       │
│  └────────────┘ └────────────┘ └────────────┘                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                        │
│  │ Break-Even │ │ Ad Budget  │ │ CPC Calc   │                        │
│  └────────────┘ └────────────┘ └────────────┘                        │
├──────────────────────────────────────────────────────────────────────┤
│  EXPLORE BY CATEGORY                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │Profitabil│ │Advertising│ │ Pricing │ │  Growth  │  icon + name +  │
│  │ 6 tools →│ │ 8 tools → │ │4 tools →│ │ 4 tools →│  count          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │
├──────────────────────────────────────────────────────────────────────┤
│                        [ ad slot — leaderboard, reserved 90px ]      │
├──────────────────────────────────────────────────────────────────────┤
│  WHY ECOMNIVO?                                                       │
│   Fast · Free · Accurate · Easy to use · Built for modern e-commerce │
│   (5 columns: small icon, bold label, one clarifying sentence each)  │
├──────────────────────────────────────────────────────────────────────┤
│  LATEST GUIDES                                    View all guides →  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                  │
│  │ 16:9 image   │ │              │ │              │  title, excerpt, │
│  │ Title        │ │              │ │              │  category, date  │
│  └──────────────┘ └──────────────┘ └──────────────┘                  │
├──────────────────────────────────────────────────────────────────────┤
│  FREQUENTLY ASKED QUESTIONS      (accordion, 5–6 items, FAQPage LD)  │
├──────────────────────────────────────────────────────────────────────┤
│  FOOTER  Tools | Categories | Guides | Company | Legal               │
│          © 2026 EcomNivo · Privacy · Terms · Disclaimer · Affiliate  │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

Single column throughout. Header collapses to logo + search icon + hamburger; the drawer is a full-height focus-trapped panel listing Tools / Categories / Guides / About with the CTA pinned at the bottom. Popular Tools becomes a 1-column stack of 6 (not a horizontal scroller — those hide content from crawlers and are awkward on touch). Categories go 2×2. Guides stack. Hero H1 drops to 36px, buttons go full-width and stack.

---

## 8. Admin architecture

### 8.1 Three layers of defence

```
Layer 1 — middleware.ts        cheap redirect; refreshes the Supabase session,
                               bounces unauthenticated /admin hits to /login.
                               NOT a security boundary. Cosmetic + UX.

Layer 2 — app/admin/layout.tsx AUTHORITATIVE. Server Component. Fetches the user
                               server-side, reads the role, redirects on failure.
                               Every /admin/** page inherits it.

Layer 3 — Postgres RLS         Final word. Even a leaked anon key, a bypassed
                               route, or a bug in layer 2 cannot read or write
                               staff-only data.
```

```ts
// app/admin/layout.tsx
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getSession();          // server-side, cookie-based
  if (!user) redirect('/login?next=/admin');
  if (!['editor', 'admin', 'super_admin'].includes(profile.role)) notFound();  // 404, not 403 —
  return <AdminShell role={profile.role}>{children}</AdminShell>;              // don't confirm /admin exists
}
```

Per-page guards add the finer grain: `/admin/users` and `/admin/settings` call `requireRole('super_admin')`, `/admin/tools` requires `admin`, `/admin/guides` allows `editor`.

### 8.2 Mutations

All writes go through Server Actions in `actions/`, never client-side Supabase calls. Each action follows an identical shape:

```ts
'use server';
export async function updateGuide(input: unknown) {
  const actor  = await requireRole('editor');        // 1. authorize
  const data   = updateGuideSchema.parse(input);     // 2. validate (zod)
  const result = await db.guides.update(data);       // 3. mutate (RLS still applies)
  await logActivity(actor.id, 'guide.update', 'guide', data.id);   // 4. audit
  revalidateTag(`guide:${data.slug}`);               // 5. revalidate
  revalidateTag('guides');
  return result;
}
```

Steps 1, 2, and 4 are mandatory in every action. A PR that skips one gets rejected.

### 8.3 Screens

| Route | Capability | Min role |
|---|---|---|
| `/admin` | Counts (users, tools, guides published/draft), 30-day tool usage, recent activity, unread messages | editor |
| `/admin/tools` | List, edit SEO title/description/slug/description, publish toggle, feature toggle, reorder, assign category, curate related tools | admin |
| `/admin/guides` | Full CRUD, Markdown editor with live preview, draft/schedule/publish, SEO fields, canonical, index toggle, tags, author | editor |
| `/admin/pages` | Edit the 8 static pages' Markdown + SEO | admin |
| `/admin/categories` | CRUD tool + guide categories | admin |
| `/admin/faqs` | CRUD FAQ items by scope | editor |
| `/admin/messages` | Read contact submissions, mark read/archived/spam | admin |
| `/admin/users` | List users, change roles | super_admin |
| `/admin/settings` | Site name, logo, favicon, SEO defaults, socials, GA4 ID, ad client ID, contact email | super_admin |
| `/admin/activity` | Audit log, filterable by actor/action/entity | admin |

Note what `/admin/tools` deliberately **cannot** do: create a calculator or change a formula. Adding a tool means adding a definition file and a test, then a deploy. That is the correct workflow for something whose output people make money decisions with.

### 8.4 Hardening checklist (verified in Phase 8)

Server-side authz on every admin route · zod validation on every input · sanitized Markdown rendering · rate limiting on `/api/contact` and login · no service-role key in any client bundle (CI-checked) · security headers via `next.config.ts` (HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, CSP once ad/analytics domains are known) · never render admin-authored HTML unsanitized · audit log on every mutation · `/admin` returns 404 to non-staff · no user enumeration in login errors · contact form stores `sha256(ip + salt)`, never a raw IP.

---

## 9. Development phases

Each phase ends with: `npm run build` clean, `tsc --noEmit` clean, `eslint` clean, and the stated acceptance check passing. Nothing broken is left behind.

| Phase | Scope | Done when |
|---|---|---|
| **1 — Foundation** ✅ | Next 16 + TS strict + Tailwind v4 scaffold, design tokens, `components/ui/*`, Header/MobileNav/Footer, homepage (static data), SEO factory, sitemap, robots, 404, Organization + WebSite JSON-LD | Homepage renders at 3 breakpoints with no horizontal scroll; Lighthouse ≥ 95 across the board; every route in §5 either exists or 404s intentionally |
| **2 — Tool engine + first 5** ✅ | `ToolDefinition` types, registry, `ToolPage`/`ToolRunner`, formatting, currency selector, `/tools`, `/categories`, `/tools/[slug]`. Tools: ROAS, Break-Even ROAS, E-commerce Profit, Profit Margin, CPC | 5 tools live with full content sections; **every `compute` has hand-verified unit tests incl. zero/negative/empty inputs**; each page has unique metadata + breadcrumbs + WebApplication LD |
| **3 — Remaining 17 tools** ✅ | The rest of Appendix A, grouped by category | 22 tools live, all tested; `/categories/[slug]` populated; related-tool graph complete; no orphan pages |
| **4 — Content & CMS** ✅* | Supabase project, migrations, RLS, generated types, guides + pages + FAQ read paths, Markdown pipeline, `/guides`, `/guides/[slug]`, all 8 legal/about pages, `/search` | Guides render from DB with Article LD; sitemap includes published guides only; drafts return 404 to the public |
| **5 — Auth** | `@supabase/ssr` clients, middleware session refresh, `/login`, callback, `profiles` + role hook, `requireRole` guards | A `user`-role account gets 404 on `/admin`; RLS verified by direct anon-key query against every table |
| **6 — Admin** | Admin shell, all screens from §8.3, server actions with the 5-step shape, audit log, on-demand revalidation | An editor can publish a guide and see it live in < 30s without a deploy; role restrictions verified per route |
| **7 — Monetization & analytics** ✅* | GA4 (consent-aware), typed event layer, `tool_usage` beacon, `<AdSlot />` wired to settings, `<AffiliateLink />` + `affiliate_links` table | Events fire with correct names; ad slots reserve space and cause **zero** CLS; affiliate links carry `rel="sponsored nofollow"` |
| **8 — Audits** | Security review, SEO audit, performance audit, a11y audit (keyboard + screen reader), cross-device QA | All four audit reports written to `docs/audits/` with issues fixed, not just logged |
| **9 — Launch** | Vercel production, domain, env vars, Search Console + sitemap submission, GA4 live, error monitoring, `docs/RUNBOOK.md` | Live on the production domain; sitemap accepted; CWV green in the field-data placeholder state |

Phases 1–3 need no Supabase account. That is deliberate: real, indexable, monetizable value ships before any backend exists.

---

## 10. Phase 1 — as built

Completed 2026-08-12. Build, `tsc --noEmit` and ESLint all pass clean; 15 routes prerendered static.

### Deviations from the plan above, and why

| # | Change | Reason |
|---|---|---|
| 1 | **`/tools`, `/categories` and `/categories/[slug]` pulled forward from Phase 2.** | The homepage's primary CTA is "Explore Tools". Shipping Phase 1 without those routes would have meant the main call to action led to a 404. They were cheap once the catalog and `ToolCard` existed. |
| 2 | **Site search deferred to Phase 4**, and the search control removed from the header. | `/search` needs the guides index to search over. A search icon that opens nothing is worse than no search icon. The header is Tools / Categories / Guides / About + CTA until then. |
| 3 | **Legal pages (privacy, terms, disclaimer, editorial policy, affiliate disclosure) not built, and not linked in the footer.** | They need real, reviewed content, which is Phase 4's job. Placeholder legal text is worse than an absent link — it is indexable, meaningless, and it misleads. |
| 4 | **`/about` built as a static page** rather than waiting for the DB. | The header needs a fourth item and the site needs a trust page. The copy is written to be verifiable — no invented team, no invented history. Phase 4 moves it into the `pages` table; the route does not change. |
| 5 | **"Latest Guides" omitted from the homepage.** | Arrives in Phase 4 with real guides. Three placeholder cards would make a finished page look unfinished. |
| 6 | **All 22 tools listed as `planned`.** They render as inert, dashed "Coming soon" cards, are excluded from the sitemap, and are never linked. | Honest roadmap without any thin pages or dead links. Phase 2 flips the first five to `live`. |

### One correction to §5.1

**`opengraph-image` does not cascade to nested route segments.** The plan assumed a single root-level card would cover the whole site; it does not — it applies only to its own segment. Verified against the live build: with only `app/opengraph-image.tsx`, every page except `/` shipped with no `og:image` at all.

Fixed by extracting `components/seo/og-image.tsx` (a shared generator taking eyebrow / title / subtitle) and giving each segment a thin `opengraph-image.tsx` that calls it. Every page now has its own prerendered, static card with page-specific text, including one per category. Phase 2 follows the same pattern at `app/tools/[slug]/opengraph-image.tsx`.

### Three bugs found by running it locally

None of these were visible in the build output, the typecheck or the lint. They only appeared once a real browser rendered the production build.

1. **`opengraph-image` does not cascade** (see above) — every page except `/` had no social card.
2. **`AdSlot` left a hole in production.** The component returns `null` until an ad client is configured, but the caller supplied the wrapping `<Container className="py-10">`, so an unconfigured slot collapsed to an empty-but-padded band. Worse, the homepage's "Why EcomNivo?" section carried `pt-0` on the assumption the ad slot above it provided the spacing — so in production that section sat flush against the one above it. Fixed by making `AdSlot` own its container and vertical rhythm, so it disappears completely when it renders nothing.
3. **Heading levels skipped from `h1` to `h3`** on `/categories` and `/categories/[slug]`. The tool and category cards hardcoded `h3`, which is right on the homepage and `/tools` (where they sit under a section `h2`) but wrong where the cards are the page's top-level content. Fixed with an explicit `headingLevel` prop; the visual size stays `text-h3` either way, since heading level is document structure and not type scale.

### Verified in the production build

- Every route: unique title, unique meta description, correct absolute canonical, OG + Twitter tags, and a working `image/png` OG card.
- `/guides` is `noindex, follow` and absent from the sitemap — it has no content to rank yet.
- Sitemap contains only indexable pages (8 URLs); `robots.txt` disallows `/admin`, `/api/`, `/account`, `/dashboard`, `/search` before those routes exist.
- Structured data: Organization + WebSite sitewide, BreadcrumbList and CollectionPage on listing pages, FAQPage on the homepage. `WebSite.potentialAction` deliberately omitted until `/search` exists.
- One `<h1>` per page, no heading-level skips.
- Design tokens compile to real utilities (checked in the emitted CSS, including the responsive and `group-open` variants) — a silent `@theme` typo would have failed quietly.
- Unknown routes 404 correctly, including `/tools/roas-calculator` and unknown category slugs (`dynamicParams = false`).

### Measured in a real browser

Driven with Playwright against `next start` (the production build), not the dev server.

**Lighthouse** — mobile preset unless noted:

| Route | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` (desktop preset) | 100 | 100 | 100 | 100 |
| `/` | 98 | 100 | 100 | 100 |
| `/tools` | 98 | 100 | 100 | 100 |
| `/categories` | 97 | 100 | 100 | 100 |
| `/categories/advertising` | 100 | 100 | 100 | 100 |

Desktop metrics on `/`: FCP 0.2s, LCP 0.4s, **CLS 0**, TBT 0ms, Speed Index 0.2s. The Phase 1 acceptance criterion (≥95 across the board) is met.

**Interaction and responsive** — 15 automated checks, all passing:

- No horizontal scroll on 7 routes × 3 viewport widths (320 / 390 / 768).
- Mobile nav: opens as a labelled `dialog`, moves focus into the panel, traps Tab, locks background scroll, closes on Escape, returns focus to the trigger, restores scroll, and closes on navigation.
- FAQ answers are present in the DOM while collapsed (crawlable, and consistent with the FAQPage markup).
- Skip link is the first tab stop, becomes visible on focus, and targets `#main`.

### Known gaps carried into later phases

- **No CSP.** Deliberate: it lands in Phase 7/8 once the analytics and ad origins are known. The other security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are live now.
- **No tests in the repo yet.** Vitest arrives in Phase 2 with the first calculator — there is currently no logic worth testing. The browser checks above were run from a scratch directory so that Playwright stays out of the project's dependencies until it earns a place there.
- **Mobile perf is 97–98, not 100**, on the lighter pages. The only opportunity Lighthouse reports is ~81 KiB of unused JavaScript, which is the React/Next runtime itself. Not worth chasing at this stage.
- **Lighthouse was run against `localhost`.** Real-world field data will differ; re-run against the deployed site in Phase 8.

---

## 11. Phase 2 — as built

Completed 2026-08-12. Five calculators live: ROAS, Break-Even ROAS, CPC, E-commerce Profit, Profit Margin. 33 routes prerendered. 83 unit tests, build, typecheck and lint all pass.

### One correction to §1.2: the engine/content split

The `ToolDefinition` interface in §1.2 put `compute` and the page prose in one object. That does not survive contact with the server/client boundary.

`compute` is a function, so it cannot be passed to the calculator island as a prop — the island has to *import* it. And importing a module pulls in everything reachable from it, so a merged definition would ship every tool's FAQs, worked example and explanations to the browser as dead weight: about 4 KB of prose per tool, ~25 KB gzipped once all 22 exist, on every tool page, for text that is already in the HTML.

`ToolDefinition` is now two types:

| | `ToolEngine` — `lib/tools/engines/` | `ToolDefinition` — `lib/tools/content/` |
|---|---|---|
| Holds | `fields`, `compute` | intro, formula, example, interpretation, mistakes, FAQs, related links, SEO |
| Reaches the browser | yes, via the island | no, server-rendered only |
| Imported by | `ToolRunner` | the page component |

`registry.ts` pairs them by slug and proves at build time that they agree.

**Verified against the real bundle**, not assumed: the tool page's client JS contains the field labels and result notes (it needs them) and contains none of the intro, formula explanation, worked example, common mistakes or FAQ answers — all of which are present in the HTML. Another tool's prose appears in neither.

**Measured cost of the whole calculator island: 14.4 KB raw / 5.1 KB gzipped**, on top of a 208 KB gzipped framework baseline that every page already pays. `lucide-react` was confirmed tree-shaken — unused icon names are absent from the bundle.

### A correction to §18: the semantic palette failed contrast

The brief's suggested success/warning/error colours do not meet WCAG AA as text, which §24 requires. Measured:

| Token | Brief's value | on `#FFFFFF` | on `#F9FAFB` | Now |
|---|---|---|---|---|
| Success | `#16A34A` | 3.30 ✗ | 3.15 ✗ | `#15803D` — 5.02 / 4.80 ✓ |
| Warning | `#F59E0B` | 2.15 ✗ | 2.06 ✗ | `#B45309` — 5.02 / 4.81 ✓ |
| Error | `#DC2626` | 4.83 ✓ | 4.62 ✓ | `#B91C1C` — 6.47 / 6.19 ✓ |

Every use of these tokens in this product is text or a border. A calculator that colours a profit figure green owes the reader a green they can read, so the lightness was reduced and the hue kept. Background, text, border and brand colours are unchanged from the brief. Lighthouse accessibility went from 90 to 100 as a result.

### The other bug found by running it

The results panel's `<dl>` nested `<dt>`/`<dd>` two `<div>`s deep, which is invalid — description list items must be direct children of the list or of a single wrapping `div`. It broke the accessibility tree (Lighthouse "Agentic Browsing" 50 → 100 once fixed). The note now renders as a second `<dd>`, which is valid: one term may have several descriptions.

### Verified by driving it in a browser

28 automated checks against the production build, all passing:

- All five tool pages return 200; a `planned` tool still 404s.
- Results update as you type (`8000/2000` → `4.00×`, retyped to `9000/3000` → `3.00×`).
- **Zero ad spend renders "—", and the page contains no `Infinity` or `NaN`.**
- An empty required field shows the waiting state rather than asserting zero; a negative input is rejected with a message; a fraction in an integer field is rejected.
- Reset restores the documented defaults and the documented result.
- Currency switches the symbol only — `$40.00` → `£40.00`, the number unchanged — and the choice survives a reload.
- One `<h1>`; JSON-LD carries WebApplication, BreadcrumbList, FAQPage, Organization and WebSite; canonical correct; each tool has its own prerendered OG card; FAQ answers present in the HTML while collapsed.
- No horizontal scroll on 5 tool pages × 4 widths; no console errors and no failed requests.

Lighthouse: **Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100, CLS 0.**

### Known gaps carried into later phases

- **Performance score is not reliably measurable in this environment.** Mid-run, the host machine had 36 Chrome processes belonging to the user, and Lighthouse's CPU-throttled scores moved with the load — a Phase 1 page that measured 100 earlier measured 80 in the same session, and one tool page produced TBT figures ranging from 1,830 ms to 10,565 ms across identical runs. The byte measurements above are load-independent and stand; the performance *score* should be re-taken on a quiet machine or in CI. CLS is 0 in every run.
- The `sum()`-based cost total means a future tool with a genuinely negative cost line would need its own handling; no current tool has one.
- Related **guides** are empty on every tool (Phase 4). The two-related-links rule is currently met by related tools alone.

---

## 12. Phase 3 — as built

Completed 2026-08-12. **All 22 calculators are live.** 298 unit tests, 68 prerendered routes, build / typecheck / lint clean.

### The document was wrong, and the process caught it

Appendix A #10 (Shopify Profit) stated **$5,461**. Re-deriving it by hand before writing the engine gave **$5,511** — payment fees are 0.029 × 10,000 + 0.30 × 200 = 350, so 10,000 − 4,000 − 350 − 39 − 100 = 5,511. A $50 error, sitting in the reference table that Phases 2 and 3 were both told to trust.

Had the engine been written from the appendix and the test written from the engine, the site would have shipped a Shopify calculator whose worked example did not match its own arithmetic. The rule that caught it — *derive by hand first, assert the hand-derived number, never assert whatever the code returns* — is the single most valuable thing in this document. The appendix now carries the corrected figure and a note.

### What was added

| Category | Tools |
|---|---|
| Advertising | CPM, CTR, CPA, CAC, Ad Budget |
| Profitability | Shopify Profit, Product Profit, Gross Profit, Net Profit |
| Pricing | Markup, Selling Price, Discount, Wholesale Pricing |
| Growth | Conversion Rate, AOV, Revenue, Customer LTV |

Several tools take optional inputs that unlock extra results rather than existing as separate pages — CPM yields CTR and CPC when given clicks; CPA yields ROAS when given an order value; CAC and LTV each yield the LTV:CAC ratio. This deepens each page instead of spawning near-duplicate ones, which is the doorway-page rule from §5.4 applied to features rather than URLs.

### Cross-checks between tools

Tools that share arithmetic are asserted to agree, so a change to one cannot silently contradict another:

- CPM, CTR and CPC all resolve to Appendix A's 500 / 100,000 / 1,250 figures.
- CPA's derived ROAS (4.00×) matches the ROAS calculator on the same inputs.
- CAC's LTV:CAC ratio (4.05×) matches the LTV calculator's.
- Net Profit's gross profit and margin match the Gross Profit calculator exactly.
- Revenue, Conversion Rate and AOV are mutually consistent on 25,000 / 1.8% / 75.
- Selling Price is back-checked: for target margins of 10, 25, 40, 60 and 80%, the price it returns is re-measured and must reproduce that margin to 8 decimal places.

### Verified by driving all 22 in a browser

28 automated checks, all passing:

- All 22 pages return 200, each renders a real result from its defaults, each has a unique title and meta description, and each has exactly one `<h1>`.
- **No page prints `NaN`, `Infinity` or `undefined`** anywhere in its visible text.
- The sitemap lists all 22; no "Coming soon" badges remain; every card links out.
- Spot-checked end to end: selling price `$83.33`, Shopify profit `$5,511.00`, LTV `$202.50` — matching the hand-derived values.
- An impossible input (100% target margin) degrades to "—" with an explanation rather than crashing or printing Infinity.
- No horizontal scroll on any of the 22 at 320px; no console errors; no failed requests.

Lighthouse on the most complex new pages (Shopify has nine fields; Wholesale has two primary results): **Accessibility 100, SEO 100, Best Practices 100, CLS 0.**

### A note on one test that failed for the wrong reason

The first browser run flagged all 22 pages for containing the word "undefined". That was the test's fault, not the site's: `textContent` includes `<script>` contents, and Next's RSC payload legitimately contains the string. Switched to `innerText`, which reads only rendered text. Worth recording because the same trap will catch anyone writing a similar assertion later.

### Known gaps carried into later phases

- **Performance scores remain unmeasured on a quiet machine** — see §11. Accessibility, SEO, best-practices and CLS are load-independent and were verified.
- `relatedGuides` is still empty on every tool; guides arrive in Phase 4.
- Shopify Payments rates are editable fields with commonly published defaults, not live data. They will drift, and the page says so rather than pretending otherwise.

---

## 13. Phase 4 — as built

Completed 2026-08-12. 80 prerendered routes, 328 tests, build / typecheck / lint clean.

**\*The asterisk on the phase table:** the migrations are written but **not applied**, because there is no Supabase project to apply them to. What that means in practice is set out below — it is the one place this phase deviates materially from the plan.

### What shipped

| | |
|---|---|
| Guides | 3 full guides, `/guides`, `/guides/[slug]`, per-guide OG cards, Article structured data |
| Pages | `/about` plus 5 legal pages — privacy, terms, disclaimer, editorial policy, affiliate disclosure |
| FAQ | `/faq` with 12 questions; the homepage shows the first 6 from the same array |
| Search | `/search` over tools, guides and categories; header and mobile-nav entry points; `SearchAction` in `WebSite` schema |
| Markdown | Server-rendered `react-markdown` + `remark-gfm` + `rehype-sanitize`, styled through an explicit component map |
| Database | 3 migrations: full schema, the JWT role hook, and every RLS policy |

### The Supabase decision

There is no Supabase project, so no read path could be written *and verified*. Writing an unverifiable database layer and calling the phase done would have been the worst of the options — it would look finished and nobody would know whether it worked until Phase 5.

Instead:

1. **The migrations are complete and reviewable** — `0001_schema.sql` (14 tables), `0002_auth_and_roles.sql` (the custom access token hook, the new-user trigger, and the `guard_role_change` trigger that stops a user promoting themselves), `0003_rls.sql` (every policy from §4.3, plus a `SECURITY DEFINER` function so the audit log is append-only with no insert policy granted to any client).
2. **The content layer is an interface with a file-backed implementation.** `lib/content/guides.ts` and `lib/content/pages.ts` expose `listGuides()`, `getGuide()`, `getPage()` and friends. Phase 5 replaces their bodies with queries; no caller changes.

That is not scaffolding to be thrown away. §0 decision 2 requires the site to render with an empty or unreachable database, so a file-backed fallback is part of the design either way — Phase 5 makes the database the primary source and this the fallback.

### Related guides are declared once

A guide lists the tools it explains. The tool pages read that relationship backwards via `getGuidesForTool()`, rather than each tool maintaining its own list of guides.

Storing it at both ends would mean two lists to keep in sync, and they would drift the first time someone was in a hurry. `ToolDefinition.relatedGuides` survives as a manual override that takes precedence when non-empty, for when an editor wants a specific selection.

### Two bugs found by running it

1. **`/guides` skipped from `h1` to `h3`** — the same bug class as the category pages in Phase 2, in a component written after that fix. `GuideCard` now takes the same explicit `headingLevel` prop as `ToolCard` and `CategoryGrid`. Accessibility 98 → 100. Worth noting that the earlier fix did not generalise on its own; the third component repeated the mistake.
2. **Two controls shared the accessible name "Search tools and guides"** — the header link and the search input. Announced back to back that is confusing, so the header link is now just "Search".

### Verified by driving it

39 automated checks, all passing: every new route returns 200; markdown renders as real elements rather than raw source (headings, tables, code blocks all present); internal markdown links become working `next/link` navigations; `Article` schema carries real `datePublished`/`dateModified`; `og:type` is `article`; each guide has its own prerendered OG card; `WebSite` now declares a `SearchAction`; the homepage lists guides; the footer links every legal page; search returns and ranks results, reflects the query in the URL, deep-links from `?q=`, and shows an empty state; the sitemap lists guides and legal pages and excludes `/search`; `/search` is `noindex`; no horizontal scroll at 320px; no console errors; no failed requests.

The Phase 2 and Phase 3 suites were re-run for regressions — all still pass.

Lighthouse on the new page types: **Accessibility 100, SEO 100, Best Practices 100, CLS 0** on `/guides/markup-vs-margin`, `/guides`, `/faq` and `/privacy-policy`.

Search ranking, spot-checked: "margin" → 11 results, Profit Margin Calculator first; "roas" → 4, ROAS Calculator first; "shopify" → 1.

### Open items carried into Phase 5

- **`siteConfig.contactEmail` is `null`, and that is a launch blocker.** A privacy policy has to name a way to reach the data controller and inventing an address was not an option. Every legal page renders an explicit "contact details are not yet published" notice while it is unset, derived from the config so setting it updates all of them at once.
- **`/contact` is not built.** It needs the `contact_messages` table, a server action and rate limiting — all of which need the database. It is not linked anywhere, rather than shipping a contact page with no working contact method.
- **The legal pages need review by someone qualified.** They are specific and honest about what this site actually does, which is better than a template, but that is not the same as being reviewed.
- **The privacy policy describes a site with no analytics and no advertising**, because that is true today. Phase 7 changes what is collected, and must update that page in the same change.
### The build was running out of memory

Partway through this phase the build began aborting with `FATAL ERROR: Zone Allocation failed - process out of memory`. It looked transient at first — one failure, then a clean retry — but it became reproducible.

The cause was not the code. Next spawns one build worker per CPU; on an 8-core machine that is seven full Node processes, each loading the markdown pipeline and Satori for the OG images. The machine has 7.8 GB of RAM with roughly 1 GB free, so the workers were exhausting system memory rather than any single heap limit. (Worth checking before blaming the code: our own tooling accounted for 44 MB of it.)

Fixed with `experimental.cpus: 2` in `next.config.ts`. Notably `staticGenerationMinPagesPerWorker` alone did **not** fix it — that option governs only the static-generation phase, and the build was also failing during "collecting page data". `cpus` caps both.

The build now completes in about 3 seconds of generation for 80 pages, verified over four consecutive runs with no failures. This is a good default to keep rather than a local workaround: CI runners are frequently more memory-constrained than laptops, and raising per-process heap would have made a system-level shortage worse, not better.

---

## 14. Phase 7 — as built

Completed 2026-08-12. **Phases 5 and 6 were skipped by decision** — both depend on Supabase, and the call was to keep everything local until the rest is proven. This phase is the next one that does not need a database.

**\*The asterisk:** the `tool_usage` beacon is the one item deferred, because it writes to Postgres. Everything it would have recorded is covered by the GA4 event layer instead.

### Consent is the whole design

Analytics on this site is off unless two independent things are true: a measurement ID is configured, **and** the visitor has actively agreed.

The tag is not loaded-then-disabled. It is **never requested**. Consent Mode's "load and deny storage" pattern is legitimate, but not making the request at all is simpler to reason about and trivially verifiable — open the network tab and either `googletagmanager.com` is there or it is not.

Three deliberate choices in the banner:

- **Default denied.** A meaningful share of the audience is UK/EU, where analytics storage needs prior consent. "Unset" is treated exactly like "denied" everywhere except deciding whether to ask.
- **Decline is a real button**, styled identically to accept. A greyed-out or hidden refusal is not freely given consent.
- **It does not block the page.** No overlay, no scrim, no focus trap. The calculators stay usable either way.

### What is collected, and what never is

Seven events, defined as a closed TypeScript union in `lib/analytics/events.ts` so a typo is a compile error rather than a metric that silently never arrives: `tool_calculate`, `tool_copy_results`, `tool_reset`, `currency_change`, `search`, `cta_click`, `affiliate_click`.

**No calculator input is ever included.** We record that a calculation happened and which tool it was — never the revenue, costs or margins someone typed. That is asserted in the browser test, which greps the entire dataLayer for the figure it entered.

`track()` is a no-op for three independent reasons, all normal rather than error conditions: analytics unconfigured, consent not granted, or the tag not yet loaded. No caller checks any of them.

### A metric that would have been useless

The first implementation fired `tool_calculate` on mount. Every tool ships with working defaults, so a freshly loaded page is already a complete calculation — which made the event fire on page load and again on the first edit.

That would have made `tool_calculate` roughly equal to page views, and useless for the one question it exists to answer: is anyone actually running their own numbers? Now gated on a `touched` flag set by the first input change. The browser test asserts it fires exactly once per edit.

### Advertising

`AdSlot` delegates to `AdUnit`, written against AdSense (which is what a `ca-pub-…` client ID implies). Swapping provider means changing that one file.

**Ads also require consent** — no consent, no ad request. Personalised advertising needs consent in the UK and EU, and rather than guess at a non-personalised fallback we could not verify, the request simply is not made. That is a revenue trade-off made knowingly, and it is flagged as the item to revisit against the provider's consent-mode documentation before launch rather than discovered afterwards.

### Affiliate

`affiliateProgrammes` is **empty**, and a test asserts it stays that way. There are no affiliate partnerships, so there are no affiliate links — the brief forbids fake ones and the disclosure page says so publicly.

What exists is the enforcement: `AffiliateLink` applies `rel="sponsored nofollow noopener noreferrer"`, renders a visible `(affiliate)` marker, fires an outbound event, and renders **plain text** rather than a dead link for an unknown or inactive programme. `AffiliateNotice` is a Server Component that renders nothing while there are no active programmes, so it can never become a stale claim that a page earns commission when it does not.

The rules published on /affiliate-disclosure are therefore enforced by the component, not by whoever adds the first link.

### Verified in a browser, both ways

The build was run twice — once with no measurement ID and once with `G-TEST123456` — because the interesting behaviour is what happens in each state.

**Unconfigured (4 checks):** no banner, no analytics requests, no `gtag` on `window`, and using a calculator sends nothing.

**Configured (14 checks):** banner appears; nothing loads before a choice; decline is a real button; the banner does not block the page; declining dismisses it, loads nothing, and is remembered across a reload; accepting loads the tag and fires a real collect request; `gtag` becomes defined; `tool_calculate` reaches the dataLayer **once per edit**; the event carries `{tool_slug, category}` and nothing else; and the figure typed into the calculator appears nowhere in any queued payload.

Phases 2, 3 and 4 suites re-run — no regressions. 340 unit tests pass.

> A test bug worth recording: `gtag` pushes the `arguments` object, which is array-*like* but not an `Array`. `Array.isArray()` silently rejects it and made the first run report no events at all. `Array.from()` is what reads it.

### The machine ran out of memory again

Mid-phase the build began failing at ~0.7 GB free, and neither `cpus: 2` nor `experimental.memoryBasedWorkersCount` was enough at that level — the dev server was killed by the OS too. `memoryBasedWorkersCount` was reverted rather than kept, because keeping configuration that demonstrably did not fix the case it was added for is exactly the unverifiable-code problem this document keeps arguing against.

Once memory freed up, every build and every check passed. `cpus: 2` stands as the verified setting. **This is an environment constraint, not a code fault** — but it is worth knowing that this project needs roughly 1.5–2 GB free to build.

### Open items

- **Ads-without-consent** needs a decision before launch: serve non-personalised ads to visitors who decline, or accept the lost inventory. The current behaviour is the conservative one.
- `tool_usage` (the database beacon) still to come with Supabase.
- The privacy policy has been updated to describe the consent flow accurately, and now describes what analytics collects **when enabled**. It must be revisited again if advertising is switched on.

---

## 15. Phase 6 — the admin panel (local edition)

Completed 2026-08-12. 81 routes, 342 tests, 29 browser checks against a running admin.

Built out of order and without Supabase, on the instruction to keep everything local until the rest is proven.

### The constraint that shaped it

An admin panel that saves needs somewhere to save to. With Supabase deferred, that is `data/*.json` on disk, behind a repository interface (`lib/db/repositories.ts`) that the Supabase implementation will later satisfy without any caller changing.

**This is not a throwaway shim.** §0 decision 2 already required the site to render with an empty or unreachable database, so a non-database source had to exist regardless. Supabase makes the database primary and this the fallback.

Its one hard limit, stated plainly rather than discovered later: **serverless hosting has a read-only filesystem, so content editing will not work on Vercel.** Locally, and on any host with a writable disk, it works fully.

### Content resolution

Everything now resolves store-first with the code seeds underneath:

```
store record exists?  ->  use it (admin wins)
otherwise             ->  use the built-in seed
```

That is what makes "revert to built-in version" a real operation: deleting an override restores the original text rather than deleting content. It also means a fresh clone with no `data/` directory is a complete, working site.

Tools resolve the same way through `lib/tools/resolve.ts`, which merges admin overrides onto the code catalog. Unpublishing a tool removes it from listings, search, the sitemap and its own route — without deleting anything, and without touching the calculator in code.

### Three layers of access control, as designed in §8.1

| Layer | Where | What it actually does |
|---|---|---|
| 1 | `proxy.ts` | Redirects when no session cookie is present. **Not a security boundary** — it runs at the edge without the signing secret, so it cannot verify anything. |
| 2 | `app/admin/layout.tsx` | The authoritative check. Verifies the HMAC signature and expiry server-side. Every `/admin` page inherits it. |
| 3 | RLS | Written and migrated, inert until Supabase. |

Verified: a **forged session cookie gets past layer 1 and is rejected by layer 2**, which is exactly the behaviour the three-layer design exists to produce.

Other security properties, all deliberate: sessions are HMAC-signed with constant-time comparison; the login form is throttled to 8 attempts per 15 minutes; failures return one message regardless of cause; an under-privileged user gets **404, not 403**, so probing `/admin/settings` confirms nothing; and the `next` parameter is restricted to `/admin` paths so a crafted login link cannot become an open redirect.

Local password auth is a stopgap. It reads from the environment, is never hardcoded, and disables admin entirely when unset — but Supabase Auth with real per-user roles replaces it.

### Every mutation follows the same five steps

`authorize → validate → mutate → audit → revalidate`. Listed at the top of `actions/admin.ts` because that is the file people copy from. The audit log is append-only and capped; nothing in the interface can edit or delete an entry.

### What admin cannot do, and why

**It cannot create a calculator or change a formula.** This was raised in §0 decision 1 and is worth restating because the request came back: a formula stored in a database has to be evaluated at runtime, which means either an unsafe `eval` or an expression engine nobody can unit-test. Every calculator here is a pure function with hand-verified tests, because people make pricing decisions with the output — and this project has already caught one $50 error that way.

The admin screen says this in plain language rather than hiding the limitation. A **safe formula builder** — a parsed AST over declared numeric fields, with a whitelisted operator set and no `eval` — is the right way to deliver it, and is the next substantial piece of work rather than something to bolt on badly.

Admin **can** create brand new pages at any URL, which was the other half of the request.

### Verified by driving it

29 browser checks, all passing: signed-out access to `/admin` and deep admin URLs redirects; a forged cookie is rejected; a wrong password is refused and the right one signs in; all five screens load; editing a tool's SEO title appears on the public page; unpublishing a tool 404s it and removes it from the sitemap, and republishing restores it; a **new page created in the admin is live at its URL, renders its Markdown, and appears in the sitemap**; a reserved slug like `tools` is refused; a **new guide is invisible as a draft and public once published**, and the tool it references links back to it automatically; settings save; the audit log recorded `auth.login`, `tool.update`, `page.create`, `guide.create` and `settings.update`; signing out revokes access.

### Open items

- **Supabase**: swap `lib/db/repositories.ts` and `lib/auth/*`. The migrations, RLS policies and role hook are already written.
- **Roles**: the local session is always `super_admin`. The role model, ranking and guards are in place and used; multi-user roles need real accounts.
- **Categories** are still code-defined. They are a fixed set of four that the tool catalog is typed against, so making them editable means widening `CategorySlug` from a union to a string — worth doing with Supabase, not before.
- **A safe formula builder**, as above.

---

## Appendix A — Verified formulas

Hand-derived, each with a worked check. These become the unit-test fixtures — the tests assert *these* numbers, not whatever the implementation happens to return.

### Advertising

| # | Tool | Formula | Check |
|---|---|---|---|
| 1 | ROAS | `Revenue ÷ Ad spend` (also ×100 as %) | 8000 ÷ 2000 = **4.0×** |
| 2 | Break-Even ROAS | `1 ÷ Gross margin`, where margin = `(Price − COGS − variable) ÷ Price` | margin 40% → 1 ÷ 0.40 = **2.5×** |
| 3 | CPC | `Ad spend ÷ Clicks` | 500 ÷ 1250 = **$0.40** |
| 4 | CPM | `(Ad spend ÷ Impressions) × 1000` | (500 ÷ 100000) × 1000 = **$5.00** |
| 5 | CTR | `(Clicks ÷ Impressions) × 100` | (1250 ÷ 100000) × 100 = **1.25%** |
| 6 | CPA | `Ad spend ÷ Conversions` | 500 ÷ 25 = **$20.00** |
| 7 | CAC | `(Sales + Marketing spend) ÷ New customers` | (4000 + 6000) ÷ 200 = **$50.00** |
| 8 | Ad Budget | `Revenue goal ÷ Target ROAS`; daily = `÷ days` | 50000 ÷ 4 = **$12,500**; ÷30 = **$416.67/day** |

CPA vs CAC is a real distinction, not a synonym: CPA counts *conversions* against *ad spend*; CAC counts *new customers* against *total sales + marketing cost*. Both tools state this and cross-link.

### Profitability

| # | Tool | Formula | Check |
|---|---|---|---|
| 9 | E-commerce Profit | `Revenue − (COGS + shipping + transaction fees + ad spend + other)`; margin = `Net ÷ Revenue` | 10000 − (4000+800+300+2000+500) = **$2,400** → **24.0%** |
| 10 | Shopify Profit | as above + `(rate% × revenue + fixed × orders)` + subscription + apps | 10000 − 4000 − (0.029×10000 + 0.30×200) − 39 − 100 = **$5,511** ⚠️ |
| 11 | Product Profit | `Price − (unit cost + shipping + fees)` per unit; × units | 49.99 − (18 + 4.50 + 1.75) = **$25.74/unit** |
| 12 | Profit Margin | `((Revenue − Cost) ÷ Revenue) × 100` | ((100 − 60) ÷ 100) × 100 = **40.0%** |
| 13 | Gross Profit | `Revenue − COGS`; margin = `÷ Revenue` | 100000 − 62000 = **$38,000** → **38.0%** |
| 14 | Net Profit | `Revenue − (COGS + operating + other expenses)` | 100000 − (62000+21000+5000) = **$12,000** → **12.0%** |

### Pricing

| # | Tool | Formula | Check |
|---|---|---|---|
| 15 | Markup | `((Price − Cost) ÷ Cost) × 100`; reverse: `Price = Cost × (1 + markup)` | ((75 − 50) ÷ 50) × 100 = **50%** |
| 16 | Selling Price | `Cost ÷ (1 − target margin)` | 50 ÷ (1 − 0.40) = **$83.33** |
| 17 | Discount | `Sale = Price × (1 − d)`; reverse: `d = (Price − Sale) ÷ Price` | 120 × 0.75 = **$90.00**, saving $30 |
| 18 | Wholesale Pricing | `Wholesale = Cost × (1 + wholesale markup)`; `RRP = Wholesale × (1 + retail markup)` | 10 × 2 = **$20** → × 2.5 = **$50 RRP** |

Markup ≠ margin is the highest-value teaching point on this site. A 50% *markup* on $50 gives $75 (33.3% margin); a 50% *margin* requires $100. Tools 15 and 16 each surface both figures and cross-link.

### Growth

| # | Tool | Formula | Check |
|---|---|---|---|
| 19 | Conversion Rate | `(Conversions ÷ Sessions) × 100` | (450 ÷ 25000) × 100 = **1.80%** |
| 20 | AOV | `Revenue ÷ Orders` | 45000 ÷ 600 = **$75.00** |
| 21 | Revenue | `Sessions × CVR × AOV` | 25000 × 0.018 × 75 = **$33,750** |
| 22 | Customer LTV | `AOV × Purchase frequency × Lifespan (yrs) × Gross margin`; plus `LTV ÷ CAC` | 75 × 3 × 2 × 0.45 = **$202.50**; ÷ 50 = **4.05:1** |

Tool 22 reports margin-adjusted LTV as the headline (revenue-based LTV flatters every business) and states the assumption plainly.

> ⚠️ **#10 was wrong in the original version of this document**, which gave $5,461. Payment fees are 0.029 × 10,000 + 0.30 × 200 = 350, so 10,000 − 4,000 − 350 − 39 − 100 = **$5,511**, a $50 error. It was caught in Phase 3 by re-deriving the figure by hand before writing the engine, which is exactly the rule this appendix exists to enforce. The test asserts $5,511.

### Edge cases every calculator handles

Zero denominator → `null` + explanatory note, never `Infinity` or `NaN` · empty field → not treated as `0`, the result simply waits · negative cost/spend → validation error, not a silent nonsense answer · margin ≥ 100% in tool 16 → error explaining the price is unreachable · very large inputs → correct formatting, no exponent notation · rounding applied **only at display time**, never mid-calculation.

---

## Appendix B — Environment variables

```bash
# .env.local  (never committed; .env.example is)
NEXT_PUBLIC_SITE_URL=https://ecomnivo.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only; delete if unused after Phase 6
REVALIDATE_SECRET=
CONTACT_IP_SALT=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=     # Phase 7
NEXT_PUBLIC_AD_CLIENT_ID=           # Phase 7
```

Validated once at boot by a zod schema in `config/env.ts` — a missing variable fails the build loudly rather than producing a broken page at runtime.

---

## Appendix C — Explicitly out of scope for v1

Deferred on purpose, with the architecture left open for each: user accounts for the public site (`/account`, `/dashboard` are reserved routes, not built) · saved calculations · premium tiers and `/pricing` · multi-language / hreflang · comments · newsletter · dark mode · PDF export · a public API · currency conversion (see Decision 4).

Adding any of these later touches new files rather than rewriting existing ones. That is the test of whether this architecture is right.
