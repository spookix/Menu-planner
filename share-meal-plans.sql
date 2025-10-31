-- Sharing schema for meal plans

-- 1) Table linking an owner to a recipient
create table if not exists public.meal_plan_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(owner_id, shared_with_id)
);

-- 2) RLS for meal_plan_shares: owners can manage, recipients can view
alter table public.meal_plan_shares enable row level security;

drop policy if exists "Owners can view shares" on public.meal_plan_shares;
create policy "Owners can view shares" on public.meal_plan_shares
  for select using (auth.uid() = owner_id or auth.uid() = shared_with_id);

drop policy if exists "Owners can insert shares" on public.meal_plan_shares;
create policy "Owners can insert shares" on public.meal_plan_shares
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete shares" on public.meal_plan_shares;
create policy "Owners can delete shares" on public.meal_plan_shares
  for delete using (auth.uid() = owner_id);

-- 3) Extend meal_plans policies so that recipients can access and modify owner's plans
drop policy if exists "Users can view own meal plans" on public.meal_plans;
create policy "Users can view own or shared meal plans" on public.meal_plans
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.meal_plan_shares s
      where s.owner_id = meal_plans.user_id and s.shared_with_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own meal plans" on public.meal_plans;
create policy "Users can insert own or shared meal plans" on public.meal_plans
  for insert with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.meal_plan_shares s
      where s.owner_id = meal_plans.user_id and s.shared_with_id = auth.uid()
    )
  );

drop policy if exists "Users can update own meal plans" on public.meal_plans;
create policy "Users can update own or shared meal plans" on public.meal_plans
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.meal_plan_shares s
      where s.owner_id = meal_plans.user_id and s.shared_with_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own meal plans" on public.meal_plans;
create policy "Users can delete own or shared meal plans" on public.meal_plans
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.meal_plan_shares s
      where s.owner_id = meal_plans.user_id and s.shared_with_id = auth.uid()
    )
  );

-- 4) Helper function to resolve a user by email for invitations
create or replace function public.resolve_user_by_email(p_email text)
returns table(id uuid, username text)
language sql
security definer
set search_path = public
as $$
  select u.id,
         coalesce(up.username, split_part(u.email, '@', 1)) as username
  from auth.users u
  left join public.user_profiles up on up.id = u.id
  where lower(u.email) = lower(p_email)
$$;

revoke all on function public.resolve_user_by_email(text) from public;
grant execute on function public.resolve_user_by_email(text) to authenticated, anon;

