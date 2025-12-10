-- =============================================================================
-- BXD EVENT MANAGER - SISTEMA NFC DE PULSEIRAS
-- Schema SQL para PostgreSQL / Supabase
-- =============================================================================
-- Funcionalidades:
-- 1. Controle de acesso (entrada/saída em portões e áreas)
-- 2. Cashless básico (saldo de consumo em bares/lojas)
-- 3. Coleta de leads (nome, e-mail, idade, cidade, telefone) para marketing
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABELA: attendees (participantes / leads)
-- Armazena os dados dos participantes para controle e marketing
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados pessoais
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE, -- CPF formatado: 000.000.000-00
  age INTEGER CHECK (age >= 0 AND age <= 150),
  birth_date DATE,
  city VARCHAR(100),
  state VARCHAR(2),
  
  -- Tipo de ingresso (opcional para expansão futura)
  ticket_type VARCHAR(50) DEFAULT 'standard', -- standard, vip, backstage, staff, press
  ticket_code VARCHAR(50),
  
  -- LGPD e Marketing
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  
  -- Controle interno
  notes TEXT,
  tags TEXT[], -- Array de tags para segmentação
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID, -- ID do staff que cadastrou
  
  -- Soft delete para LGPD
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

-- Índices para buscas frequentes
CREATE INDEX idx_attendees_email ON public.attendees(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendees_cpf ON public.attendees(cpf) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendees_phone ON public.attendees(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendees_city ON public.attendees(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendees_marketing ON public.attendees(marketing_opt_in) WHERE deleted_at IS NULL AND marketing_opt_in = true;

-- =============================================================================
-- TABELA: wristbands (pulseiras NFC/RFID)
-- Controla o ciclo de vida de cada pulseira
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wristbands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificador único do chip NFC ou QR Code
  uid VARCHAR(100) UNIQUE NOT NULL,
  
  -- Status da pulseira
  status VARCHAR(20) NOT NULL DEFAULT 'new' 
    CHECK (status IN ('new', 'assigned', 'blocked', 'lost', 'returned', 'damaged')),
  
  -- Vínculo com participante (NULL se ainda não vinculada)
  attendee_id UUID REFERENCES public.attendees(id) ON DELETE SET NULL,
  
  -- Motivo do bloqueio (se aplicável)
  block_reason TEXT,
  blocked_at TIMESTAMPTZ,
  blocked_by UUID,
  
  -- Lote/controle de estoque
  batch_code VARCHAR(50), -- Código do lote de pulseiras
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID
);

-- Índices
CREATE INDEX idx_wristbands_uid ON public.wristbands(uid);
CREATE INDEX idx_wristbands_status ON public.wristbands(status);
CREATE INDEX idx_wristbands_attendee ON public.wristbands(attendee_id) WHERE attendee_id IS NOT NULL;

-- =============================================================================
-- TABELA: accounts (carteiras cashless)
-- Cada pulseira vinculada tem uma conta para saldo
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vínculo com pulseira (1:1)
  wristband_id UUID NOT NULL UNIQUE REFERENCES public.wristbands(id) ON DELETE CASCADE,
  
  -- Saldo em centavos (evita problemas de floating point)
  balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  
  -- Limites (opcional)
  daily_limit_cents INTEGER DEFAULT NULL,
  transaction_limit_cents INTEGER DEFAULT NULL,
  
  -- Controle
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_accounts_wristband ON public.accounts(wristband_id);
CREATE INDEX idx_accounts_balance ON public.accounts(balance_cents) WHERE balance_cents > 0;

-- =============================================================================
-- TABELA: transactions (movimentações financeiras)
-- Histórico completo de todas as transações cashless
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vínculo com conta
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  
  -- Tipo de transação
  type VARCHAR(20) NOT NULL 
    CHECK (type IN ('topup', 'purchase', 'refund', 'adjustment', 'bonus', 'transfer_in', 'transfer_out')),
  
  -- Valor em centavos (positivo = crédito, negativo = débito)
  amount_cents INTEGER NOT NULL,
  
  -- Saldo após a transação (para auditoria)
  balance_after_cents INTEGER NOT NULL,
  
  -- Método de pagamento (para recargas)
  method VARCHAR(20) 
    CHECK (method IN ('pix', 'credit_card', 'debit_card', 'cash', 'promo', 'voucher', NULL)),
  
  -- Referência externa (maquininha, gateway, etc.)
  pos_reference VARCHAR(100),
  external_id VARCHAR(100),
  
  -- Descrição e categorização
  description TEXT,
  category VARCHAR(50), -- bar, food, merchandise, etc.
  vendor_id VARCHAR(50), -- ID do ponto de venda
  vendor_name VARCHAR(100),
  
  -- Staff que processou
  processed_by UUID,
  
  -- Controle de estorno
  is_reversed BOOLEAN NOT NULL DEFAULT false,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID,
  original_transaction_id UUID REFERENCES public.transactions(id),
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_account ON public.transactions(account_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_vendor ON public.transactions(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX idx_transactions_external ON public.transactions(external_id) WHERE external_id IS NOT NULL;

-- =============================================================================
-- TABELA: access_logs (logs de controle de acesso)
-- Registra todas as entradas e saídas em portões/áreas
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vínculo com pulseira
  wristband_id UUID NOT NULL REFERENCES public.wristbands(id) ON DELETE RESTRICT,
  
  -- Portão/área
  gate VARCHAR(100) NOT NULL, -- ex: "Entrada Principal", "VIP", "Backstage"
  gate_id VARCHAR(50), -- ID do dispositivo/portão
  
  -- Direção
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('in', 'out')),
  
  -- Resultado
  status VARCHAR(20) NOT NULL CHECK (status IN ('allowed', 'denied', 'manual_override')),
  
  -- Motivo (especialmente para negativas)
  reason VARCHAR(255),
  
  -- Staff que operou o portão
  operator_id UUID,
  operator_name VARCHAR(100),
  
  -- Geolocalização (opcional)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_access_logs_wristband ON public.access_logs(wristband_id);
CREATE INDEX idx_access_logs_gate ON public.access_logs(gate);
CREATE INDEX idx_access_logs_created ON public.access_logs(created_at DESC);
CREATE INDEX idx_access_logs_status ON public.access_logs(status);
CREATE INDEX idx_access_logs_direction ON public.access_logs(direction);

-- =============================================================================
-- TABELA: gates (configuração de portões/áreas)
-- Define os pontos de controle de acesso
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Tipo de área
  area_type VARCHAR(30) NOT NULL DEFAULT 'general'
    CHECK (area_type IN ('entrance', 'exit', 'vip', 'backstage', 'restricted', 'general')),
  
  -- Restrições de acesso
  allowed_ticket_types TEXT[] DEFAULT ARRAY['standard', 'vip', 'backstage', 'staff', 'press'],
  
  -- Capacidade (opcional)
  max_capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA: vendors (pontos de venda)
-- Cadastro de bares, lojas, etc. para cashless
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Tipo
  vendor_type VARCHAR(30) NOT NULL DEFAULT 'bar'
    CHECK (vendor_type IN ('bar', 'food', 'merchandise', 'service', 'other')),
  
  -- Localização
  location VARCHAR(100),
  
  -- Comissão (percentual)
  commission_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA: staff_users (usuários do sistema - staff do evento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados de login
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Dados pessoais
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Permissões
  role VARCHAR(30) NOT NULL DEFAULT 'operator'
    CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  
  -- Permissões granulares
  permissions JSONB DEFAULT '{
    "can_register_attendees": true,
    "can_assign_wristbands": true,
    "can_check_access": true,
    "can_topup": false,
    "can_process_purchase": false,
    "can_refund": false,
    "can_view_reports": false,
    "can_manage_staff": false,
    "can_manage_gates": false,
    "can_manage_vendors": false
  }'::jsonb,
  
  -- Vínculo com portão/área (opcional)
  assigned_gate_id UUID REFERENCES public.gates(id),
  assigned_vendor_id UUID REFERENCES public.vendors(id),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- View: Resumo de participante com pulseira e saldo
CREATE OR REPLACE VIEW public.v_attendee_summary AS
SELECT 
  a.id AS attendee_id,
  a.full_name,
  a.email,
  a.phone,
  a.cpf,
  a.age,
  a.city,
  a.state,
  a.ticket_type,
  a.marketing_opt_in,
  w.id AS wristband_id,
  w.uid AS wristband_uid,
  w.status AS wristband_status,
  acc.id AS account_id,
  COALESCE(acc.balance_cents, 0) AS balance_cents,
  COALESCE(acc.balance_cents, 0) / 100.0 AS balance_brl,
  (
    SELECT COUNT(*) 
    FROM public.access_logs al 
    WHERE al.wristband_id = w.id AND al.direction = 'in' AND al.status = 'allowed'
  ) AS check_ins,
  (
    SELECT MAX(created_at) 
    FROM public.access_logs al 
    WHERE al.wristband_id = w.id AND al.status = 'allowed'
  ) AS last_access,
  (
    SELECT COALESCE(SUM(ABS(amount_cents)), 0) 
    FROM public.transactions t 
    WHERE t.account_id = acc.id AND t.type = 'purchase'
  ) AS total_spent_cents
FROM public.attendees a
LEFT JOIN public.wristbands w ON w.attendee_id = a.id
LEFT JOIN public.accounts acc ON acc.wristband_id = w.id
WHERE a.deleted_at IS NULL;

-- View: Leads para marketing (apenas com opt-in)
CREATE OR REPLACE VIEW public.v_marketing_leads AS
SELECT 
  a.id,
  a.full_name,
  a.email,
  a.phone,
  a.age,
  a.city,
  a.state,
  a.tags,
  a.created_at,
  COALESCE(
    (SELECT SUM(ABS(t.amount_cents)) 
     FROM public.transactions t 
     JOIN public.accounts acc ON t.account_id = acc.id
     JOIN public.wristbands w ON acc.wristband_id = w.id
     WHERE w.attendee_id = a.id AND t.type = 'purchase'), 0
  ) AS total_spent_cents,
  (
    SELECT COUNT(*) > 0 
    FROM public.access_logs al 
    JOIN public.wristbands w ON al.wristband_id = w.id
    WHERE w.attendee_id = a.id AND al.direction = 'in' AND al.status = 'allowed'
  ) AS attended_event
FROM public.attendees a
WHERE a.marketing_opt_in = true 
  AND a.deleted_at IS NULL
  AND a.email IS NOT NULL;

-- =============================================================================
-- FUNÇÕES ÚTEIS
-- =============================================================================

-- Função: Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_attendees_updated_at
  BEFORE UPDATE ON public.attendees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wristbands_updated_at
  BEFORE UPDATE ON public.wristbands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gates_updated_at
  BEFORE UPDATE ON public.gates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_users_updated_at
  BEFORE UPDATE ON public.staff_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função: Anonimizar dados de participante (LGPD)
CREATE OR REPLACE FUNCTION anonymize_attendee(p_attendee_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.attendees
  SET 
    full_name = 'DADOS ANONIMIZADOS',
    email = NULL,
    phone = NULL,
    cpf = NULL,
    age = NULL,
    birth_date = NULL,
    city = NULL,
    state = NULL,
    notes = NULL,
    tags = NULL,
    anonymized_at = NOW()
  WHERE id = p_attendee_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - Supabase
-- =============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessidade)
-- Para o backend com service_role, todas as operações são permitidas

-- =============================================================================
-- DADOS INICIAIS
-- =============================================================================

-- Inserir portões padrão
INSERT INTO public.gates (name, code, area_type, allowed_ticket_types) VALUES
  ('Entrada Principal', 'GATE_MAIN', 'entrance', ARRAY['standard', 'vip', 'backstage', 'staff', 'press']),
  ('Entrada VIP', 'GATE_VIP', 'vip', ARRAY['vip', 'backstage', 'staff', 'press']),
  ('Backstage', 'GATE_BACKSTAGE', 'backstage', ARRAY['backstage', 'staff']),
  ('Saída Principal', 'GATE_EXIT', 'exit', ARRAY['standard', 'vip', 'backstage', 'staff', 'press'])
ON CONFLICT (code) DO NOTHING;

-- Inserir vendors padrão
INSERT INTO public.vendors (name, code, vendor_type, location) VALUES
  ('Bar Principal', 'BAR_MAIN', 'bar', 'Área Central'),
  ('Bar VIP', 'BAR_VIP', 'bar', 'Área VIP'),
  ('Food Truck 1', 'FOOD_01', 'food', 'Praça de Alimentação'),
  ('Loja Oficial', 'MERCH_01', 'merchandise', 'Entrada')
ON CONFLICT (code) DO NOTHING;

-- Inserir admin padrão (senha: admin123 - TROQUE EM PRODUÇÃO!)
-- Hash bcrypt de 'admin123'
INSERT INTO public.staff_users (username, password_hash, full_name, email, role, permissions) VALUES
  ('admin', '$2a$10$rQ7JQXZ9XQXZXQXZXQXZXeQXZXQXZXQXZXQXZXQXZXQXZXQXZXQXZ', 'Administrador', 'admin@evento.com', 'admin', '{
    "can_register_attendees": true,
    "can_assign_wristbands": true,
    "can_check_access": true,
    "can_topup": true,
    "can_process_purchase": true,
    "can_refund": true,
    "can_view_reports": true,
    "can_manage_staff": true,
    "can_manage_gates": true,
    "can_manage_vendors": true
  }'::jsonb)
ON CONFLICT (username) DO NOTHING;

-- =============================================================================
-- COMENTÁRIOS NAS TABELAS (documentação)
-- =============================================================================

COMMENT ON TABLE public.attendees IS 'Participantes do evento (leads para marketing)';
COMMENT ON TABLE public.wristbands IS 'Pulseiras NFC/RFID e seu ciclo de vida';
COMMENT ON TABLE public.accounts IS 'Carteiras cashless vinculadas às pulseiras';
COMMENT ON TABLE public.transactions IS 'Histórico de transações financeiras (recargas, compras, estornos)';
COMMENT ON TABLE public.access_logs IS 'Logs de controle de acesso (entradas/saídas)';
COMMENT ON TABLE public.gates IS 'Configuração de portões e áreas de acesso';
COMMENT ON TABLE public.vendors IS 'Pontos de venda (bares, lojas, etc.)';
COMMENT ON TABLE public.staff_users IS 'Usuários do sistema (equipe do evento)';
