-- =============================================================================
-- EcomNivo — initial schema
--
-- See docs/ARCHITECTURE.md §4.1. Fourteen tables, UUID primary keys,
-- timestamptz everywhere, RLS enabled in 0002.
--
-- Note what is NOT here: nothing stores a calculator's formula. The maths
-- lives in typed, unit-tested TypeScript (§0, decision 1). These tables hold
-- the editable content and SEO shell around each tool, and the guides.
-- =============================================================================

create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'editor', 'admin', 'super_admin');
create type public.content_status as enum ('draft', 'scheduled', 'published');

-- --- identity ----------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        public.app_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Changed only by super_admin. Enforced by the guard_role_change trigger in 0003, because RLS cannot express "every column except this one".';

-- --- tools: SEO and content shell only ---------------------------------------

create table public.tool_categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text,
  sort_order      int not null default 0,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.tools (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  category_id       uuid references public.tool_categories(id) on delete set null,
  name              text,
  short_description text,
  seo_title         text,
  seo_description   text,
  is_published      boolean not null default true,
  is_featured       boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.tools is
  'Overrides for a tool that already exists in lib/tools/. A missing row is not an error: the code defaults apply (§0, decision 2).';

create index tools_category_sort_idx on public.tools (category_id, sort_order);
create index tools_featured_idx on public.tools (is_featured) where is_published;

create table public.tool_related (
  tool_id         uuid not null references public.tools(id) on delete cascade,
  related_tool_id uuid not null references public.tools(id) on delete cascade,
  sort_order      int not null default 0,
  primary key (tool_id, related_tool_id),
  constraint tool_related_not_self check (tool_id <> related_tool_id)
);

-- --- content -----------------------------------------------------------------

create table public.authors (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  slug       text unique not null,
  name       text not null,
  bio        text,
  avatar_url text,
  links      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.guide_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  int not null default 0
);

create table public.guides (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  excerpt            text,
  content_md         text not null default '',
  featured_image_url text,
  featured_image_alt text,
  author_id          uuid references public.authors(id) on delete set null,
  category_id        uuid references public.guide_categories(id) on delete set null,
  status             public.content_status not null default 'draft',
  published_at       timestamptz,
  seo_title          text,
  seo_description    text,
  canonical_url      text,
  is_indexable       boolean not null default true,
  reading_minutes    int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index guides_published_idx on public.guides (status, published_at desc);

create table public.tags (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table public.guide_tags (
  guide_id uuid not null references public.guides(id) on delete cascade,
  tag_id   uuid not null references public.tags(id) on delete cascade,
  primary key (guide_id, tag_id)
);

-- --- editable static pages: about, contact, faq, and all legal ----------------

create table public.pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  content_md      text not null default '',
  seo_title       text,
  seo_description text,
  is_published    boolean not null default true,
  updated_at      timestamptz not null default now()
);

create table public.faq_items (
  id           uuid primary key default gen_random_uuid(),
  scope        text not null check (scope in ('site', 'tool', 'guide')),
  scope_ref    text,
  question     text not null,
  answer_md    text not null,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  constraint faq_scope_ref_required check (scope = 'site' or scope_ref is not null)
);

create index faq_items_scope_idx on public.faq_items (scope, scope_ref);

-- --- operations --------------------------------------------------------------

-- Exactly one row. PUBLICLY READABLE — nothing secret goes in here (§0,
-- decision 7). Secrets live in environment variables.
create table public.site_settings (
  id                     smallint primary key default 1,
  site_name              text not null default 'EcomNivo',
  logo_url               text,
  favicon_url            text,
  default_seo_title      text,
  default_seo_description text,
  social_links           jsonb not null default '{}'::jsonb,
  ga4_measurement_id     text,
  ad_client_id           text,
  contact_email          text,
  updated_at             timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

insert into public.site_settings (id) values (1);

-- Aggregate usage only. No user id, no session id, and never the visitor's
-- input values — those stay in the browser.
create table public.tool_usage (
  id         bigserial primary key,
  tool_slug  text not null,
  event      text not null check (event in ('view', 'calculate', 'copy', 'reset')),
  currency   text,
  country    text,
  created_at timestamptz not null default now()
);

create index tool_usage_slug_idx on public.tool_usage (tool_slug, created_at desc);

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  ip_hash    text,
  status     text not null default 'new' check (status in ('new', 'read', 'archived', 'spam')),
  created_at timestamptz not null default now()
);

comment on column public.contact_messages.ip_hash is
  'sha256(ip || CONTACT_IP_SALT). Never store a raw IP — it is personal data and we only need it to rate-limit.';

create index contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);

create table public.admin_activity_logs (
  id          bigserial primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index admin_activity_logs_created_idx on public.admin_activity_logs (created_at desc);

-- --- updated_at maintenance ---------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger tool_categories_touch before update on public.tool_categories
  for each row execute function public.touch_updated_at();
create trigger tools_touch before update on public.tools
  for each row execute function public.touch_updated_at();
create trigger guides_touch before update on public.guides
  for each row execute function public.touch_updated_at();
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();
