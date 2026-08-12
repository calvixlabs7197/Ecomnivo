-- =============================================================================
-- EcomNivo — roles in the JWT, and the privilege-escalation guard
--
-- See docs/ARCHITECTURE.md §4.2.
--
-- The naive approach — reading profiles.role inside a policy on profiles —
-- recurses infinitely. Instead a custom access token hook stamps the role into
-- the JWT at sign-in, and policies read it from there: no table lookup, no
-- recursion, one fewer query per row check.
--
-- Trade-off, and it is a real one: a role change takes effect on the user's
-- next token refresh (up to an hour), not immediately. The admin UI says so
-- when a role is changed.
-- =============================================================================

-- --- the hook -----------------------------------------------------------------
-- Registered in the Supabase dashboard under Authentication > Hooks, or in
-- config.toml for local development. See docs/RUNBOOK.md.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  select role into user_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  claims := jsonb_set(
    claims,
    '{app_metadata,user_role}',
    to_jsonb(coalesce(user_role, 'user'::public.app_role))
  );

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on table public.profiles to supabase_auth_admin;

create policy "auth admin can read roles for the token hook"
  on public.profiles
  for select
  to supabase_auth_admin
  using (true);

-- --- role helpers --------------------------------------------------------------
-- Read the stamped claim. No table access, so these are safe to call from any
-- policy including those on profiles itself.

create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'user_role', 'anon')
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select public.jwt_role() in ('editor', 'admin', 'super_admin')
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() in ('admin', 'super_admin')
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() = 'super_admin'
$$;

-- --- new users get a profile ---------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- privilege-escalation guard -------------------------------------------------
--
-- Users may update their own profile. Without this trigger that includes the
-- `role` column, so anyone could promote themselves to super_admin. RLS has no
-- way to say "any column but that one", so a trigger does it.

create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'insufficient privilege: changing a role requires super_admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_role_change();
