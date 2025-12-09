-- Adicionar campos para Prestação de Contas Lei de Incentivo
-- Migration: 002_add_lei_incentivo_fields
-- Data: 2025-12-09

ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS supplier_cnpj text,
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoice_date date,
  ADD COLUMN IF NOT EXISTS rubric text CHECK (rubric IN ('PESSOAL', 'ESTRUTURA', 'LOGÍSTICA', 'DIVULGAÇÃO', 'DESPESAS ADMINISTRATIVAS', 'IMPOSTOS, TAXAS, SEGUROS')),
  ADD COLUMN IF NOT EXISTS budget_item text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_date date,
  ADD COLUMN IF NOT EXISTS tax_retention jsonb,
  ADD COLUMN IF NOT EXISTS net_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS quantity numeric(10,2),
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS unit_quantity numeric(10,2),
  ADD COLUMN IF NOT EXISTS unit_value numeric(14,2),
  ADD COLUMN IF NOT EXISTS incentive_value numeric(14,2),
  ADD COLUMN IF NOT EXISTS own_resources_value numeric(14,2);

-- Índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_transactions_rubric ON public.transactions(rubric);
CREATE INDEX IF NOT EXISTS idx_transactions_supplier_cnpj ON public.transactions(supplier_cnpj);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_date ON public.transactions(invoice_date);

-- Comentários explicativos
COMMENT ON COLUMN public.transactions.supplier_cnpj IS 'CNPJ/CPF do fornecedor';
COMMENT ON COLUMN public.transactions.rubric IS 'Rubrica orçamentária: PESSOAL, ESTRUTURA, LOGÍSTICA, DIVULGAÇÃO, DESPESAS ADMINISTRATIVAS, IMPOSTOS';
COMMENT ON COLUMN public.transactions.tax_retention IS 'Retenções fiscais: {inss: 0.11, irrf: 0.015, iss: 0.05}';
COMMENT ON COLUMN public.transactions.incentive_value IS 'Valor financiado por Lei de Incentivo';
COMMENT ON COLUMN public.transactions.own_resources_value IS 'Valor de recursos próprios/bilheteria';
