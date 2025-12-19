-- ========================================
-- SETUP COMPLETO DO BANCO - BXD EVENT MANAGER
-- ========================================
-- Execute este SQL no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Cole TUDO de uma vez e clique em RUN

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Timeline de eventos
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna completed se não existir
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Gravações de reuniões
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER NOT NULL,
  participants TEXT[] DEFAULT '{}',
  transcript TEXT,
  summary TEXT,
  action_items JSONB,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  deadline DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  account_name TEXT,
  api_key TEXT,
  access_token TEXT,
  connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instituicao TEXT,
  skills TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (para sistema de trial/assinatura)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  subscription_plan TEXT NOT NULL DEFAULT 'starter',
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
  max_events INTEGER NOT NULL DEFAULT 1,
  max_team_members INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. HABILITAR RLS (Row Level Security)
-- ============================================

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. POLÍTICAS DE ACESSO (Permitir tudo para autenticados)
-- ============================================

-- Timeline
DROP POLICY IF EXISTS "timeline_select" ON timeline_events;
DROP POLICY IF EXISTS "timeline_insert" ON timeline_events;
DROP POLICY IF EXISTS "timeline_update" ON timeline_events;
DROP POLICY IF EXISTS "timeline_delete" ON timeline_events;
CREATE POLICY "timeline_select" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "timeline_insert" ON timeline_events FOR INSERT WITH CHECK (true);
CREATE POLICY "timeline_update" ON timeline_events FOR UPDATE USING (true);
CREATE POLICY "timeline_delete" ON timeline_events FOR DELETE USING (true);

-- Meetings
DROP POLICY IF EXISTS "meetings_select" ON meeting_recordings;
DROP POLICY IF EXISTS "meetings_insert" ON meeting_recordings;
DROP POLICY IF EXISTS "meetings_update" ON meeting_recordings;
DROP POLICY IF EXISTS "meetings_delete" ON meeting_recordings;
CREATE POLICY "meetings_select" ON meeting_recordings FOR SELECT USING (true);
CREATE POLICY "meetings_insert" ON meeting_recordings FOR INSERT WITH CHECK (true);
CREATE POLICY "meetings_update" ON meeting_recordings FOR UPDATE USING (true);
CREATE POLICY "meetings_delete" ON meeting_recordings FOR DELETE USING (true);

-- Compliance Items
DROP POLICY IF EXISTS "compliance_items_select" ON compliance_items;
DROP POLICY IF EXISTS "compliance_items_insert" ON compliance_items;
DROP POLICY IF EXISTS "compliance_items_update" ON compliance_items;
DROP POLICY IF EXISTS "compliance_items_delete" ON compliance_items;
CREATE POLICY "compliance_items_select" ON compliance_items FOR SELECT USING (true);
CREATE POLICY "compliance_items_insert" ON compliance_items FOR INSERT WITH CHECK (true);
CREATE POLICY "compliance_items_update" ON compliance_items FOR UPDATE USING (true);
CREATE POLICY "compliance_items_delete" ON compliance_items FOR DELETE USING (true);

-- Compliance Documents
DROP POLICY IF EXISTS "compliance_docs_select" ON compliance_documents;
DROP POLICY IF EXISTS "compliance_docs_insert" ON compliance_documents;
DROP POLICY IF EXISTS "compliance_docs_update" ON compliance_documents;
DROP POLICY IF EXISTS "compliance_docs_delete" ON compliance_documents;
CREATE POLICY "compliance_docs_select" ON compliance_documents FOR SELECT USING (true);
CREATE POLICY "compliance_docs_insert" ON compliance_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "compliance_docs_update" ON compliance_documents FOR UPDATE USING (true);
CREATE POLICY "compliance_docs_delete" ON compliance_documents FOR DELETE USING (true);

-- Analytics
DROP POLICY IF EXISTS "analytics_select" ON analytics_accounts;
DROP POLICY IF EXISTS "analytics_insert" ON analytics_accounts;
DROP POLICY IF EXISTS "analytics_update" ON analytics_accounts;
DROP POLICY IF EXISTS "analytics_delete" ON analytics_accounts;
CREATE POLICY "analytics_select" ON analytics_accounts FOR SELECT USING (true);
CREATE POLICY "analytics_insert" ON analytics_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_update" ON analytics_accounts FOR UPDATE USING (true);
CREATE POLICY "analytics_delete" ON analytics_accounts FOR DELETE USING (true);

-- Volunteers
DROP POLICY IF EXISTS "volunteers_select" ON volunteers;
DROP POLICY IF EXISTS "volunteers_insert" ON volunteers;
DROP POLICY IF EXISTS "volunteers_update" ON volunteers;
DROP POLICY IF EXISTS "volunteers_delete" ON volunteers;
CREATE POLICY "volunteers_select" ON volunteers FOR SELECT USING (true);
CREATE POLICY "volunteers_insert" ON volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "volunteers_update" ON volunteers FOR UPDATE USING (true);

-- Organizations (políticas específicas para evitar recursão)
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;
DROP POLICY IF EXISTS "organizations_delete" ON organizations;

-- Permitir leitura pública (necessário para verificar slugs, etc)
CREATE POLICY "organizations_select" ON organizations FOR SELECT USING (true);

-- Permitir inserção apenas para usuários autenticados
CREATE POLICY "organizations_insert" ON organizations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir update apenas do próprio owner
CREATE POLICY "organizations_update" ON organizations FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Permitir delete apenas do próprio owner
CREATE POLICY "organizations_delete" ON organizations FOR DELETE 
  USING (auth.uid() = owner_id);

-- ============================================
-- 4. DADOS INICIAIS DE EXEMPLO
-- ============================================

-- (Removido - adicione eventos manualmente pela interface)

-- ============================================
-- 5. CONFIGURAR CORS NO SUPABASE
-- ============================================
-- Vá em: Dashboard → Project Settings → API
-- Em "API Settings" → Adicione seu domínio Vercel em "CORS Origins"

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 'Tabelas criadas:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'Políticas criadas:' as status;
SELECT tablename, COUNT(*) as policies FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename;
