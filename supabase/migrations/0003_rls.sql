-- =============================================================================
-- EcomNivo — row level security
--
-- See docs/ARCHITECTURE.md §4.3. This is the third and final layer of the
-- admin defence (§8.1): even a leaked anon key, a bypassed route or a bug in
-- the server-side role check cannot read or write staff-only data.
--
-- RLS is enabled on every table with no permissive default. A table with RLS
-- on and no matching policy denies everything, which is the failure mode we
-- want.
-- =============================================================================

alter table public.profiles            enable row level security;
alter table public.tool_categories     enable row level security;
alter table public.tools               enable row level security;
alter table public.tool_related        enable row level security;
alter table public.authors             enable row level security;
alter table public.guide_categories    enable row level security;
alter table public.guides              enable row level security;
alter table public.tags                enable row level security;
alter table public.guide_tags          enable row level security;
alter table public.pages               enable row level security;
alter table public.faq_items           enable row level security;
alter table public.site_settings       enable row level security;
alter table public.tool_usage          enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.admin_activity_logs enable row level security;

-- --- profiles -------------------------------------------------------------------

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: admins read all"
  on public.profiles for select to authenticated
  using (public.is_admin());

-- Column-level protection for `role` is the guard_role_change trigger (0002).
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles: admins update any"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --- tools ------------------------------------------------------------------------

create policy "tools: public reads published"
  on public.tools for select to anon, authenticated
  using (is_published);

create policy "tools: admins manage"
  on public.tools for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "tool_categories: public reads"
  on public.tool_categories for select to anon, authenticated using (true);

create policy "tool_categories: admins manage"
  on public.tool_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "tool_related: public reads"
  on public.tool_related for select to anon, authenticated using (true);

create policy "tool_related: admins manage"
  on public.tool_related for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- guides -------------------------------------------------------------------------
-- A scheduled guide becomes visible when published_at passes, with no cron job
-- and no deploy: the policy itself is the schedule.

create policy "guides: public reads published"
  on public.guides for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

create policy "guides: staff manage"
  on public.guides for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "guide_categories: public reads"
  on public.guide_categories for select to anon, authenticated using (true);

create policy "guide_categories: staff manage"
  on public.guide_categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "tags: public reads"
  on public.tags for select to anon, authenticated using (true);

create policy "tags: staff manage"
  on public.tags for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "guide_tags: public reads"
  on public.guide_tags for select to anon, authenticated using (true);

create policy "guide_tags: staff manage"
  on public.guide_tags for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "authors: public reads"
  on public.authors for select to anon, authenticated using (true);

create policy "authors: staff manage"
  on public.authors for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- --- pages and FAQs -------------------------------------------------------------------

create policy "pages: public reads published"
  on public.pages for select to anon, authenticated
  using (is_published);

create policy "pages: staff manage"
  on public.pages for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "faq_items: public reads published"
  on public.faq_items for select to anon, authenticated
  using (is_published);

create policy "faq_items: staff manage"
  on public.faq_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- --- site settings ----------------------------------------------------------------------
-- Readable by everyone by design: it holds only values that are already public
-- in the browser. Nothing secret goes in this table.

create policy "site_settings: public reads"
  on public.site_settings for select to anon, authenticated using (true);

create policy "site_settings: super admins update"
  on public.site_settings for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- --- operational tables -------------------------------------------------------------------
-- Insert-only for the public. A visitor can record that a tool was used and
-- can send a message; neither can read anything back.

create policy "tool_usage: anyone may record"
  on public.tool_usage for insert to anon, authenticated with check (true);

create policy "tool_usage: admins read"
  on public.tool_usage for select to authenticated using (public.is_admin());

create policy "contact_messages: anyone may submit"
  on public.contact_messages for insert to anon, authenticated with check (true);

create policy "contact_messages: admins read"
  on public.contact_messages for select to authenticated using (public.is_admin());

create policy "contact_messages: admins update status"
  on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The audit log is append-only from the application's point of view and is
-- written through a security-definer function, so no insert policy is granted
-- to any client role. Nobody can edit or delete history.
create policy "admin_activity_logs: admins read"
  on public.admin_activity_logs for select to authenticated using (public.is_admin());

create or replace function public.log_admin_activity(
  p_action      text,
  p_entity_type text default null,
  p_entity_id   text default null,
  p_meta        jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'insufficient privilege' using errcode = '42501';
  end if;

  insert into public.admin_activity_logs (actor_id, action, entity_type, entity_id, meta)
  values ((select auth.uid()), p_action, p_entity_type, p_entity_id, p_meta);
end;
$$;

revoke execute on function public.log_admin_activity from anon;
