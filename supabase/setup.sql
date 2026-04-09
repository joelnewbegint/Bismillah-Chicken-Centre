-- Run this in Supabase SQL editor for production-safe auth isolation.

create extension if not exists "pgcrypto";

create table if not exists public.sales (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  chicken_type text not null,
  weight numeric not null check (weight >= 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  total numeric not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.chicken_buying (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  chicken_type text not null,
  quantity_kg numeric not null check (quantity_kg >= 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  total numeric not null check (total >= 0),
  supplier text,
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.chicken_buying enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales' and policyname = 'sales_select_own'
  ) then
    create policy "sales_select_own" on public.sales
    for select to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales' and policyname = 'sales_insert_own'
  ) then
    create policy "sales_insert_own" on public.sales
    for insert to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales' and policyname = 'sales_update_own'
  ) then
    create policy "sales_update_own" on public.sales
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales' and policyname = 'sales_delete_own'
  ) then
    create policy "sales_delete_own" on public.sales
    for delete to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'expenses_select_own'
  ) then
    create policy "expenses_select_own" on public.expenses
    for select to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'expenses_insert_own'
  ) then
    create policy "expenses_insert_own" on public.expenses
    for insert to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'expenses_update_own'
  ) then
    create policy "expenses_update_own" on public.expenses
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'expenses_delete_own'
  ) then
    create policy "expenses_delete_own" on public.expenses
    for delete to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chicken_buying' and policyname = 'buying_select_own'
  ) then
    create policy "buying_select_own" on public.chicken_buying
    for select to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chicken_buying' and policyname = 'buying_insert_own'
  ) then
    create policy "buying_insert_own" on public.chicken_buying
    for insert to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chicken_buying' and policyname = 'buying_update_own'
  ) then
    create policy "buying_update_own" on public.chicken_buying
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chicken_buying' and policyname = 'buying_delete_own'
  ) then
    create policy "buying_delete_own" on public.chicken_buying
    for delete to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;
