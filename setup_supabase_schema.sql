-- SCRIPT 1: CRIAR ESTRUTURA DO BANCO
-- Execute este script primeiro no SQL Editor do Supabase

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Campaigns table (single source of truth)
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  public_read boolean not null default false,
  owner_user_id uuid references auth.users on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Campaign members (auth binding)
create table if not exists public.campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, user_id)
);

-- Candidate profile
create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  number text not null,
  role text not null,
  party text not null,
  coalition text,
  cnpj text,
  tse_status text not null default 'deferido',
  photo_url text,
  theme_color text,
  instagram text,
  website text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Financial headline metrics
create table if not exists public.campaign_financials (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  budget_total numeric(14,2) not null default 0,
  spent_today numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,
  spending_limit numeric(14,2) not null default 0,
  total_spent numeric(14,2) not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Expense categories (dashboard donut)
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  value numeric(14,2) not null default 0,
  color text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Campaign locations for map
create table if not exists public.campaign_locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  status text not null,
  coordinates jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Digital metrics snapshot
create table if not exists public.digital_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  invested numeric(14,2) not null default 0,
  reach integer not null default 0,
  leads integer not null default 0,
  videos_produced integer not null default 0,
  video_goal integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Inventory items
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  location text not null,
  quantity integer not null default 0,
  status text not null,
  item_type text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Tasks (marketing board)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  description text,
  status text not null,
  assignee text,
  cost numeric(14,2),
  linked_event_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Calendar events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  date date not null,
  location text not null,
  event_type text not null,
  status text not null default 'pending',
  weather text,
  logistics jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Financial transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null,
  txn_date date not null,
  category text not null,
  source text not null,
  asset_linked text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Team members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  role text not null,
  phone text,
  email text,
  photo_url text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

-- Vehicles
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  plate text not null,
  vehicle_type text not null,
  current_km numeric(12,2) not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

-- Fuel logs
create table if not exists public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  logged_at timestamptz not null default timezone('utc', now()),
  liters numeric(10,2) not null,
  cost numeric(12,2) not null,
  km_at_refuel numeric(12,2),
  station_name text,
  receipt_url text
);

-- Volunteers (future integration)
create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  phone text,
  points integer not null default 0,
  events_participated integer not null default 0,
  rank integer not null default 0,
  availability text[],
  skills text[],
  created_at timestamptz not null default timezone('utc', now())
);

-- Module flags
create table if not exists public.module_flags (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default false,
  unique (campaign_id, module_key)
);

-- Analytics snapshots
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  snapshot jsonb not null,
  taken_at timestamptz not null default timezone('utc', now())
);

-- User profiles (for onboarding system)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  org_name text,
  plan_tier text not null default 'starter',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Enable Row Level Security
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.campaign_financials enable row level security;
alter table public.expense_categories enable row level security;
alter table public.campaign_locations enable row level security;
alter table public.digital_metrics enable row level security;
alter table public.inventory_items enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.transactions enable row level security;
alter table public.team_members enable row level security;
alter table public.vehicles enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.volunteers enable row level security;
alter table public.module_flags enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.profiles enable row level security;

-- Helper function
create or replace function public.is_campaign_member(campaign uuid)
returns boolean as $$
declare
  member boolean;
begin
  select true into member
  from public.campaign_members
  where campaign_members.campaign_id = campaign
    and campaign_members.user_id = auth.uid()
  limit 1;
  return coalesce(member, false);
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function public.is_campaign_member(uuid) to authenticated;
grant usage on schema public to authenticated, anon;

-- RLS Policies for profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();