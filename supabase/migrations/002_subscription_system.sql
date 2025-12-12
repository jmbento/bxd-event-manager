-- ============================================================================
-- BXD Event Manager - Sistema de Assinaturas e Trial
-- Migração: 002_subscription_system.sql
-- ============================================================================

-- Tabela de Organizações (multi-tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  
  -- Configurações de assinatura
  subscription_status TEXT NOT NULL DEFAULT 'trial', -- trial, active, canceled, expired
  subscription_plan TEXT NOT NULL DEFAULT 'starter', -- starter, pro, enterprise
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- Datas importantes
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Limites do plano
  max_events INTEGER NOT NULL DEFAULT 1,
  max_team_members INTEGER NOT NULL DEFAULT 3,
  max_transactions INTEGER NOT NULL DEFAULT 100,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe ON public.organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(subscription_status);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY, -- starter, pro, enterprise
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- em centavos (R$97 = 9700)
  price_yearly INTEGER NOT NULL, -- com desconto anual
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- Limites
  max_events INTEGER NOT NULL,
  max_team_members INTEGER NOT NULL,
  max_transactions INTEGER NOT NULL,
  max_storage_mb INTEGER NOT NULL,
  
  -- Features booleanas
  has_ai_features BOOLEAN NOT NULL DEFAULT false,
  has_3d_planner BOOLEAN NOT NULL DEFAULT false,
  has_nfc_integration BOOLEAN NOT NULL DEFAULT false,
  has_api_access BOOLEAN NOT NULL DEFAULT false,
  has_white_label BOOLEAN NOT NULL DEFAULT false,
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  
  -- Ordenação
  display_order INTEGER NOT NULL DEFAULT 0,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, max_events, max_team_members, max_transactions, max_storage_mb, has_ai_features, has_3d_planner, has_nfc_integration, has_api_access, has_white_label, has_priority_support, display_order, is_popular)
VALUES 
  ('starter', 'Starter', 'Ideal para pequenos eventos', 9700, 97000, 3, 5, 500, 1024, false, false, false, false, false, false, 1, false),
  ('pro', 'Pro', 'Para produtoras e agências', 29700, 297000, 10, 20, 5000, 10240, true, true, true, false, false, true, 2, true),
  ('enterprise', 'Enterprise', 'Para grandes operações', 99700, 997000, -1, -1, -1, 102400, true, true, true, true, true, true, 3, false)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_events = EXCLUDED.max_events,
  max_team_members = EXCLUDED.max_team_members,
  max_transactions = EXCLUDED.max_transactions,
  max_storage_mb = EXCLUDED.max_storage_mb,
  has_ai_features = EXCLUDED.has_ai_features,
  has_3d_planner = EXCLUDED.has_3d_planner,
  has_nfc_integration = EXCLUDED.has_nfc_integration,
  has_api_access = EXCLUDED.has_api_access,
  has_white_label = EXCLUDED.has_white_label,
  has_priority_support = EXCLUDED.has_priority_support;

-- Histórico de pagamentos
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  
  amount INTEGER NOT NULL, -- em centavos
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL, -- succeeded, pending, failed, refunded
  
  plan_id TEXT REFERENCES public.subscription_plans(id),
  billing_period TEXT, -- monthly, yearly
  
  payment_method TEXT, -- card, pix, boleto
  card_last4 TEXT,
  card_brand TEXT,
  
  receipt_url TEXT,
  invoice_pdf_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_org ON public.payment_history(organization_id);

-- Membros da organização
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- Convites pendentes
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invites(token);

-- Vincular campaigns/eventos às organizações
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON public.campaigns(organization_id);

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Verificar se organização está em trial válido
CREATE OR REPLACE FUNCTION public.is_trial_valid(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = org_id 
    AND subscription_status = 'trial'
    AND trial_ends_at > NOW()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Verificar se organização tem assinatura ativa
CREATE OR REPLACE FUNCTION public.has_active_subscription(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = org_id 
    AND (
      subscription_status = 'active'
      OR (subscription_status = 'trial' AND trial_ends_at > NOW())
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Obter plano atual da organização
CREATE OR REPLACE FUNCTION public.get_organization_plan(org_id UUID)
RETURNS TABLE(
  plan_id TEXT,
  plan_name TEXT,
  is_trial BOOLEAN,
  days_remaining INTEGER,
  max_events INTEGER,
  max_team_members INTEGER
) AS $$
  SELECT 
    o.subscription_plan,
    p.name,
    o.subscription_status = 'trial',
    GREATEST(0, EXTRACT(DAY FROM o.trial_ends_at - NOW())::INTEGER),
    COALESCE(p.max_events, o.max_events),
    COALESCE(p.max_team_members, o.max_team_members)
  FROM public.organizations o
  LEFT JOIN public.subscription_plans p ON p.id = o.subscription_plan
  WHERE o.id = org_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Verificar limite de eventos
CREATE OR REPLACE FUNCTION public.check_event_limit(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Contar eventos atuais
  SELECT COUNT(*) INTO current_count
  FROM public.campaigns 
  WHERE organization_id = org_id;
  
  -- Obter limite do plano
  SELECT COALESCE(p.max_events, o.max_events) INTO max_allowed
  FROM public.organizations o
  LEFT JOIN public.subscription_plans p ON p.id = o.subscription_plan
  WHERE o.id = org_id;
  
  -- -1 significa ilimitado
  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can update their organizations" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Políticas para organization_members
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members" ON public.organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Políticas para payment_history
CREATE POLICY "Users can view their payment history" ON public.payment_history
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.organizations IS 'Organizações/empresas que usam o sistema';
COMMENT ON TABLE public.subscription_plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE public.payment_history IS 'Histórico de pagamentos via Stripe';
COMMENT ON TABLE public.organization_members IS 'Membros de cada organização';
COMMENT ON TABLE public.organization_invites IS 'Convites pendentes para organizações';

COMMENT ON COLUMN public.organizations.subscription_status IS 'trial, active, canceled, expired';
COMMENT ON COLUMN public.organizations.subscription_plan IS 'starter, pro, enterprise';
COMMENT ON COLUMN public.subscription_plans.price_monthly IS 'Preço em centavos (9700 = R$97,00)';
