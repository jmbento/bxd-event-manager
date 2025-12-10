-- =============================================================================
-- BXD Event Manager - Transações Atômicas
-- CRÍTICO: Garante que dinheiro nunca seja perdido
-- =============================================================================

-- 1. Função para processar transação de forma atômica
-- Isso garante que saldo NUNCA fique inconsistente
CREATE OR REPLACE FUNCTION process_cashless_transaction(
  p_account_id UUID,
  p_amount_cents INTEGER,
  p_type TEXT, -- 'topup', 'purchase', 'refund', 'reversal'
  p_description TEXT DEFAULT NULL,
  p_vendor_id UUID DEFAULT NULL,
  p_vendor_name TEXT DEFAULT NULL,
  p_pos_reference TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Lock na conta para evitar race conditions
  SELECT * INTO v_account
  FROM cashless_accounts
  WHERE id = p_account_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta não encontrada: %', p_account_id;
  END IF;
  
  IF NOT v_account.is_active THEN
    RAISE EXCEPTION 'Conta inativa';
  END IF;
  
  -- Calcular novo saldo
  CASE p_type
    WHEN 'topup', 'refund' THEN
      v_new_balance := v_account.balance_cents + ABS(p_amount_cents);
    WHEN 'purchase' THEN
      IF v_account.balance_cents < ABS(p_amount_cents) THEN
        RAISE EXCEPTION 'Saldo insuficiente. Disponível: %, Necessário: %', 
          v_account.balance_cents, ABS(p_amount_cents);
      END IF;
      v_new_balance := v_account.balance_cents - ABS(p_amount_cents);
    WHEN 'reversal' THEN
      v_new_balance := v_account.balance_cents + ABS(p_amount_cents);
    ELSE
      RAISE EXCEPTION 'Tipo de transação inválido: %', p_type;
  END CASE;
  
  -- Inserir transação
  INSERT INTO cashless_transactions (
    account_id,
    type,
    amount_cents,
    balance_after_cents,
    description,
    vendor_id,
    vendor_name,
    pos_reference,
    method,
    processed_by
  ) VALUES (
    p_account_id,
    p_type,
    CASE WHEN p_type = 'purchase' THEN -ABS(p_amount_cents) ELSE ABS(p_amount_cents) END,
    v_new_balance,
    COALESCE(p_description, p_type || ' de ' || (ABS(p_amount_cents)::numeric / 100)::text),
    p_vendor_id,
    p_vendor_name,
    p_pos_reference,
    p_method,
    p_processed_by
  ) RETURNING id INTO v_transaction_id;
  
  -- Atualizar saldo da conta
  UPDATE cashless_accounts
  SET 
    balance_cents = v_new_balance,
    total_spent_cents = CASE 
      WHEN p_type = 'purchase' THEN total_spent_cents + ABS(p_amount_cents)
      ELSE total_spent_cents
    END,
    total_loaded_cents = CASE 
      WHEN p_type = 'topup' THEN total_loaded_cents + ABS(p_amount_cents)
      ELSE total_loaded_cents
    END,
    updated_at = NOW()
  WHERE id = p_account_id;
  
  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'previous_balance_cents', v_account.balance_cents,
    'new_balance_cents', v_new_balance,
    'amount_cents', p_amount_cents,
    'type', p_type
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE WARNING 'Erro na transação: % - %', SQLERRM, SQLSTATE;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- 2. Função para estorno seguro
CREATE OR REPLACE FUNCTION reverse_transaction(
  p_transaction_id UUID,
  p_reversed_by UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_original RECORD;
  v_result JSONB;
BEGIN
  -- Buscar transação original com lock
  SELECT * INTO v_original
  FROM cashless_transactions
  WHERE id = p_transaction_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transação não encontrada: %', p_transaction_id;
  END IF;
  
  IF v_original.is_reversed THEN
    RAISE EXCEPTION 'Transação já foi estornada';
  END IF;
  
  -- Marcar original como estornada
  UPDATE cashless_transactions
  SET 
    is_reversed = true,
    reversed_at = NOW(),
    reversed_by = p_reversed_by
  WHERE id = p_transaction_id;
  
  -- Criar transação de estorno (inverte o valor)
  v_result := process_cashless_transaction(
    v_original.account_id,
    ABS(v_original.amount_cents),
    'reversal',
    COALESCE(p_reason, 'Estorno: ' || v_original.description),
    NULL,
    NULL,
    NULL,
    NULL,
    p_reversed_by
  );
  
  RETURN v_result;
END;
$$;

-- 3. Tabela de Audit Log (LGPD Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID, -- Qual evento
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, EXPORT, etc
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- 4. Função genérica de auditoria
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Aplicar triggers de auditoria nas tabelas críticas
DROP TRIGGER IF EXISTS audit_cashless_transactions ON cashless_transactions;
CREATE TRIGGER audit_cashless_transactions
  AFTER INSERT OR UPDATE OR DELETE ON cashless_transactions
  FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_cashless_accounts ON cashless_accounts;
CREATE TRIGGER audit_cashless_accounts
  AFTER INSERT OR UPDATE OR DELETE ON cashless_accounts
  FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_attendees ON attendees;
CREATE TRIGGER audit_attendees
  AFTER INSERT OR UPDATE OR DELETE ON attendees
  FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_wristbands ON wristbands;
CREATE TRIGGER audit_wristbands
  AFTER INSERT OR UPDATE OR DELETE ON wristbands
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- 6. Tabela para LGPD - Solicitações de Exclusão
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('access', 'rectification', 'erasure', 'portability')),
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  data_exported JSONB,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Função para exportar dados do usuário (LGPD - Direito de Acesso)
CREATE OR REPLACE FUNCTION export_user_data(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_attendee RECORD;
BEGIN
  -- Buscar dados do participante
  SELECT * INTO v_attendee
  FROM attendees
  WHERE email = p_email
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'message', 'Nenhum dado encontrado');
  END IF;
  
  -- Compilar todos os dados
  v_result := jsonb_build_object(
    'found', true,
    'exported_at', NOW(),
    'personal_data', to_jsonb(v_attendee),
    'transactions', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb)
      FROM cashless_transactions t
      JOIN cashless_accounts a ON t.account_id = a.id
      WHERE a.attendee_id = v_attendee.id
    ),
    'access_logs', (
      SELECT COALESCE(jsonb_agg(al), '[]'::jsonb)
      FROM access_logs al
      WHERE al.attendee_id = v_attendee.id
    ),
    'wristbands', (
      SELECT COALESCE(jsonb_agg(w), '[]'::jsonb)
      FROM wristbands w
      WHERE w.attendee_id = v_attendee.id
    )
  );
  
  -- Registrar a exportação
  INSERT INTO gdpr_requests (type, requester_email, status, data_exported)
  VALUES ('access', p_email, 'completed', v_result);
  
  RETURN v_result;
END;
$$;

-- 8. Função para anonimizar dados (LGPD - Direito ao Esquecimento)
CREATE OR REPLACE FUNCTION anonymize_user_data(
  p_email TEXT,
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attendee_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Buscar ID do participante
  SELECT id INTO v_attendee_id
  FROM attendees
  WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;
  
  -- Anonimizar dados pessoais (manter registros para contabilidade, mas sem PII)
  UPDATE attendees
  SET 
    name = 'ANONIMIZADO',
    email = 'anonimizado_' || id || '@deleted.local',
    phone = NULL,
    cpf = NULL,
    document_number = NULL,
    photo_url = NULL,
    notes = 'Dados anonimizados por solicitação LGPD',
    updated_at = NOW()
  WHERE id = v_attendee_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Registrar a solicitação
  INSERT INTO gdpr_requests (type, requester_email, status, processed_by, processed_at, notes)
  VALUES ('erasure', p_email, 'completed', p_processed_by, NOW(), 'Dados anonimizados com sucesso');
  
  RETURN jsonb_build_object(
    'success', true,
    'records_anonymized', v_count,
    'message', 'Dados pessoais anonimizados com sucesso'
  );
END;
$$;

-- 9. Índices de performance para escala
CREATE INDEX IF NOT EXISTS idx_transactions_account_date 
  ON cashless_transactions(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_event_type 
  ON cashless_transactions(event_id, type) 
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_access_logs_event_time 
  ON access_logs(event_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_wristbands_uid 
  ON wristbands(uid);

CREATE INDEX IF NOT EXISTS idx_attendees_email 
  ON attendees(email);

CREATE INDEX IF NOT EXISTS idx_attendees_cpf 
  ON attendees(cpf) 
  WHERE cpf IS NOT NULL;

-- 10. View para relatórios financeiros (otimizada)
CREATE OR REPLACE VIEW v_event_financial_summary AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  COUNT(DISTINCT a.id) AS total_attendees,
  COUNT(DISTINCT ca.id) AS accounts_with_balance,
  COALESCE(SUM(ca.balance_cents), 0) AS total_balance_cents,
  COALESCE(SUM(ca.total_loaded_cents), 0) AS total_loaded_cents,
  COALESCE(SUM(ca.total_spent_cents), 0) AS total_spent_cents,
  (
    SELECT COUNT(*) 
    FROM cashless_transactions t 
    WHERE t.event_id = e.id AND t.type = 'topup'
  ) AS topup_count,
  (
    SELECT COUNT(*) 
    FROM cashless_transactions t 
    WHERE t.event_id = e.id AND t.type = 'purchase'
  ) AS purchase_count
FROM events e
LEFT JOIN attendees a ON a.event_id = e.id
LEFT JOIN cashless_accounts ca ON ca.attendee_id = a.id
GROUP BY e.id, e.name;

-- Grant necessários
GRANT EXECUTE ON FUNCTION process_cashless_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION reverse_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION export_user_data TO authenticated;
GRANT EXECUTE ON FUNCTION anonymize_user_data TO service_role;
GRANT SELECT ON v_event_financial_summary TO authenticated;
