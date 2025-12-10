-- =====================================================
-- BXD EVENT MANAGER - Schema Supabase
-- Versão para EVENTOS (não campanhas políticas)
-- =====================================================

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Eventos (projetos/eventos que o app gerencia)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  edition text,
  description text,
  start_date date,
  end_date date,
  location text,
  expected_audience integer default 0,
  logo_url text,
  primary_color text default '#3b82f6',
  secondary_color text default '#1e40af',
  public_read boolean not null default false,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Membros do evento (controle de acesso)
create table if not exists public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer', -- 'admin', 'editor', 'viewer'
  permissions jsonb default '[]'::jsonb, -- array de módulos permitidos
  invited_by uuid references auth.users(id),
  invited_at timestamptz default timezone('utc', now()),
  accepted_at timestamptz,
  status text not null default 'pending', -- 'pending', 'active', 'revoked'
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
);

-- Convites pendentes (antes do usuário aceitar)
create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'viewer',
  permissions jsonb default '[]'::jsonb,
  invite_token text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, email)
);

-- =====================================================
-- FINANCEIRO
-- =====================================================

-- KPIs Financeiros do evento
create table if not exists public.event_financials (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  budget_total numeric(14,2) not null default 0,
  spent_today numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,
  spending_limit numeric(14,2) not null default 0,
  total_spent numeric(14,2) not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (event_id)
);

-- Tags personalizadas (Rouanet, ICMS, tags custom por evento)
create table if not exists public.finance_tags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  color text not null default 'blue',
  is_default boolean default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- Transações financeiras
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null,
  txn_date date not null,
  txn_type text not null, -- 'entrada' ou 'saida'
  category text not null,
  subcategory text,
  tags text[] default '{}', -- IDs das tags
  supplier text,
  invoice_number text,
  notes text,
  attachment_url text,
  source text not null default 'manual', -- 'manual', 'import', 'ocr'
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Categorias de despesa (para gráficos)
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  value numeric(14,2) not null default 0,
  color text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- =====================================================
-- EQUIPE E VOLUNTÁRIOS
-- =====================================================

-- Membros da equipe (diferente de users - pode ser sem login)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id), -- null se não tem conta
  name text not null,
  role text not null,
  phone text,
  email text,
  photo_url text,
  status text not null default 'active', -- 'active', 'busy', 'offline'
  created_at timestamptz not null default timezone('utc', now())
);

-- Voluntários
create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  document text, -- CPF
  points integer not null default 0,
  events_participated integer not null default 0,
  availability text[],
  skills text[],
  status text default 'pending', -- 'pending', 'approved', 'active'
  created_at timestamptz not null default timezone('utc', now())
);

-- =====================================================
-- AGENDA E TAREFAS
-- =====================================================

-- Agenda/Cronograma
create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  location text,
  item_type text not null default 'task', -- 'task', 'milestone', 'meeting', 'deadline'
  status text not null default 'pending', -- 'pending', 'in_progress', 'completed'
  assignee_id uuid references public.team_members(id),
  priority text default 'medium', -- 'low', 'medium', 'high', 'urgent'
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Tarefas do Marketing Board
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog', -- 'backlog', 'todo', 'doing', 'review', 'done'
  assignee text,
  cost numeric(14,2),
  due_date date,
  priority text default 'medium',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =====================================================
-- MÓDULOS E CONFIGURAÇÕES
-- =====================================================

-- Flags de módulos habilitados por evento
create table if not exists public.module_flags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default false,
  unique (event_id, module_key)
);

-- Configurações gerais do evento
create table if not exists public.event_settings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  key text not null,
  value jsonb,
  unique (event_id, key)
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Triggers de updated_at
create trigger set_timestamp_events
  before update on public.events
  for each row execute procedure public.set_current_timestamp_updated_at();

create trigger set_timestamp_transactions
  before update on public.transactions
  for each row execute procedure public.set_current_timestamp_updated_at();

create trigger set_timestamp_agenda
  before update on public.agenda_items
  for each row execute procedure public.set_current_timestamp_updated_at();

create trigger set_timestamp_tasks
  before update on public.tasks
  for each row execute procedure public.set_current_timestamp_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.event_invites enable row level security;
alter table public.event_financials enable row level security;
alter table public.finance_tags enable row level security;
alter table public.transactions enable row level security;
alter table public.expense_categories enable row level security;
alter table public.team_members enable row level security;
alter table public.volunteers enable row level security;
alter table public.agenda_items enable row level security;
alter table public.tasks enable row level security;
alter table public.module_flags enable row level security;
alter table public.event_settings enable row level security;

-- Função helper: verificar se usuário é membro do evento
create or replace function public.is_event_member(event_uuid uuid)
returns boolean as $$
declare
  is_member boolean;
begin
  select true into is_member
  from public.event_members
  where event_members.event_id = event_uuid
    and event_members.user_id = auth.uid()
    and event_members.status = 'active'
  limit 1;

  return coalesce(is_member, false);
end;
$$ language plpgsql security definer;

-- Função helper: verificar se usuário é admin do evento
create or replace function public.is_event_admin(event_uuid uuid)
returns boolean as $$
declare
  is_admin boolean;
begin
  select true into is_admin
  from public.event_members
  where event_members.event_id = event_uuid
    and event_members.user_id = auth.uid()
    and event_members.role = 'admin'
    and event_members.status = 'active'
  limit 1;

  return coalesce(is_admin, false);
end;
$$ language plpgsql security definer;

grant execute on function public.is_event_member(uuid) to authenticated;
grant execute on function public.is_event_admin(uuid) to authenticated;
grant usage on schema public to authenticated, anon;

-- =====================================================
-- POLICIES
-- =====================================================

-- Events: membros podem ver, admins podem editar
create policy "events-select" on public.events
  for select using (
    auth.role() = 'service_role' 
    or public.is_event_member(id) 
    or public_read is true
    or owner_user_id = auth.uid()
  );

create policy "events-insert" on public.events
  for insert with check (auth.uid() is not null);

create policy "events-update" on public.events
  for update using (
    auth.role() = 'service_role' 
    or public.is_event_admin(id)
    or owner_user_id = auth.uid()
  );

create policy "events-delete" on public.events
  for delete using (
    auth.role() = 'service_role' 
    or owner_user_id = auth.uid()
  );

-- Event Members
create policy "members-select" on public.event_members
  for select using (
    auth.role() = 'service_role' 
    or public.is_event_member(event_id)
    or user_id = auth.uid()
  );

create policy "members-insert" on public.event_members
  for insert with check (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
  );

create policy "members-update" on public.event_members
  for update using (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
  );

create policy "members-delete" on public.event_members
  for delete using (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
  );

-- Event Invites
create policy "invites-select" on public.event_invites
  for select using (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "invites-insert" on public.event_invites
  for insert with check (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
  );

create policy "invites-update" on public.event_invites
  for update using (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "invites-delete" on public.event_invites
  for delete using (
    auth.role() = 'service_role'
    or public.is_event_admin(event_id)
  );

-- Financials, Transactions, Tags - membros podem ver, admins/editors podem editar
create policy "financials-select" on public.event_financials
  for select using (public.is_event_member(event_id));

create policy "financials-all" on public.event_financials
  for all using (public.is_event_admin(event_id) or auth.role() = 'service_role');

create policy "tags-select" on public.finance_tags
  for select using (public.is_event_member(event_id));

create policy "tags-all" on public.finance_tags
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

create policy "transactions-select" on public.transactions
  for select using (public.is_event_member(event_id));

create policy "transactions-all" on public.transactions
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

create policy "expenses-select" on public.expense_categories
  for select using (public.is_event_member(event_id));

create policy "expenses-all" on public.expense_categories
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

-- Team, Volunteers
create policy "team-select" on public.team_members
  for select using (public.is_event_member(event_id));

create policy "team-all" on public.team_members
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

create policy "volunteers-select" on public.volunteers
  for select using (public.is_event_member(event_id));

create policy "volunteers-all" on public.volunteers
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

-- Agenda, Tasks
create policy "agenda-select" on public.agenda_items
  for select using (public.is_event_member(event_id));

create policy "agenda-all" on public.agenda_items
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

create policy "tasks-select" on public.tasks
  for select using (public.is_event_member(event_id));

create policy "tasks-all" on public.tasks
  for all using (public.is_event_member(event_id) or auth.role() = 'service_role');

-- Module Flags, Settings
create policy "modules-select" on public.module_flags
  for select using (public.is_event_member(event_id));

create policy "modules-all" on public.module_flags
  for all using (public.is_event_admin(event_id) or auth.role() = 'service_role');

create policy "settings-select" on public.event_settings
  for select using (public.is_event_member(event_id));

create policy "settings-all" on public.event_settings
  for all using (public.is_event_admin(event_id) or auth.role() = 'service_role');

-- =====================================================
-- DADOS INICIAIS (Tags padrão)
-- =====================================================

-- Função para criar tags padrão quando um evento é criado
create or replace function public.create_default_tags()
returns trigger as $$
begin
  insert into public.finance_tags (event_id, label, color, is_default) values
    (new.id, 'Lei Rouanet', 'purple', true),
    (new.id, 'ICMS', 'blue', true),
    (new.id, 'Patrocínio Direto', 'pink', true),
    (new.id, 'Recursos Próprios', 'gray', true);
  
  -- Criar registro de financials vazio
  insert into public.event_financials (event_id, budget_total, balance)
    values (new.id, 0, 0);
    
  return new;
end;
$$ language plpgsql;

create trigger create_default_tags_on_event
  after insert on public.events
  for each row execute procedure public.create_default_tags();

-- Função para adicionar owner como admin quando cria evento
create or replace function public.add_owner_as_admin()
returns trigger as $$
begin
  if new.owner_user_id is not null then
    insert into public.event_members (event_id, user_id, role, status, accepted_at, permissions)
    values (new.id, new.owner_user_id, 'admin', 'active', now(), '["*"]'::jsonb);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger add_owner_on_event_create
  after insert on public.events
  for each row execute procedure public.add_owner_as_admin();
