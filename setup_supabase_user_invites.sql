-- Criação da tabela de convites de usuário para organizações
create table if not exists public.user_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  org_id uuid not null,
  modules text[] not null,
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  invite_token text not null unique
);

-- Índice para busca rápida por token
grant select, insert, update on public.user_invites to anon, authenticated;
