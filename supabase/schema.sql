-- Gamma Squeeze database schema (Supabase / Postgres).
-- Run once in Supabase → SQL Editor. All reads of paid content go through the API with the service role,
-- so the content tables have RLS on and no public policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'member' check (role in ('member','editor','admin')),
  stripe_customer_id text unique,
  offer_started_at timestamptz,          -- new-user offer clock; set once, never reset
  offer_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id text primary key,                   -- Stripe subscription id
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null,                  -- Stripe status: active, trialing, past_due, canceled, ...
  price_id text,
  plan text,                             -- monthly | annual
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);

create table if not exists public.articles (
  id text primary key,                   -- url slug
  title text not null,
  dek text not null default '',
  cat text not null,                     -- display category, e.g. 期权与波动率
  chan text not null,                    -- channel tab, e.g. 期权
  syms text[] not null default '{}',
  free boolean not null default false,
  mins int not null default 5,
  img text,                              -- editorial image key (see imgs.js)
  body jsonb not null default '[]',      -- blocks: string paragraphs or {t:'chart'|'quote'|'spark'|'curve'|'vx'|'levels', ...}
  secs jsonb not null default '[]',      -- [[blockIndex, '一、标题'], ...]; paywall starts at the first section
  notes jsonb not null default '[]',
  meta jsonb not null default '{}',      -- {events:[], topics:[]}
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists articles_pub_idx on public.articles(status, published_at desc);

create table if not exists public.snapshots (
  id text primary key,
  sector text not null,
  title text not null,
  text text not null,
  data jsonb not null default '[]',
  published_at timestamptz not null default now()
);
create index if not exists snapshots_pub_idx on public.snapshots(published_at desc);

-- Premium datasets (earnings analysis, institutional holdings, congressional trades) as JSON documents,
-- refreshed by an import job from licensed / official sources.
create table if not exists public.datasets (
  kind text primary key check (kind in ('earn','insts','congress')),
  payload jsonb not null,
  source text,
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_events (
  id text primary key,                   -- idempotency for webhooks
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.articles enable row level security;
alter table public.snapshots enable row level security;
alter table public.datasets enable row level security;
alter table public.stripe_events enable row level security;

-- Signed-in users may read their own profile and subscriptions; everything else is API-only.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own subscriptions" on public.subscriptions;
create policy "own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Option Edge Index: one row per daily snapshot (both symbols in payload.rows), written by oei/run.py --publish.
create table if not exists public.oei_snapshots (
  asof date primary key,
  version text not null default '0.1',
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.oei_snapshots enable row level security;
