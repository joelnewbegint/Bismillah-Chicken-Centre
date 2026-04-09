-- Create core shop tables.

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
