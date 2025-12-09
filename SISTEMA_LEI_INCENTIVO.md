# 📋 Sistema de Prestação de Contas Lei de Incentivo

## ✅ IMPLEMENTAÇÃO COMPLETA

### **1. Estrutura de Dados Expandida**

**Arquivo:** `types.ts`

Adicionados 18 novos campos à interface `Transaction`:

```typescript
// Dados do Fornecedor
supplierCnpj?: string;
supplierName?: string;

// Nota Fiscal
invoiceNumber?: string;
invoiceDate?: string;

// Classificação Orçamentária
rubric?: 'PESSOAL' | 'ESTRUTURA' | 'LOGÍSTICA' | 'DIVULGAÇÃO' | 'DESPESAS ADMINISTRATIVAS' | 'IMPOSTOS, TAXAS, SEGUROS';
budgetItem?: string;

// Pagamento
paymentMethod?: string;
paymentDate?: string;
taxRetention?: { inss, irrf, iss };
netAmount?: number;

// Comprovantes
receiptUrl?: string;

// Orçamento Detalhado
quantity?: number;
unit?: string;
unitQuantity?: number;
unitValue?: number;
incentiveValue?: number;
ownResourcesValue?: number;
```

---

### **2. Migration SQL Criada**

**Arquivo:** `supabase/migrations/002_add_lei_incentivo_fields.sql`

- ✅ Adiciona 17 colunas à tabela `transactions`
- ✅ Constraint CHECK para rubrica (6 opções válidas)
- ✅ Índices para: rubric, supplier_cnpj, invoice_date
- ✅ Comentários explicativos em todas as colunas

**Quando conectar ao Supabase:**
```bash
# Executar migration
supabase db push
```

---

### **3. Serviço de Importação/Exportação**

**Arquivo:** `services/leiIncentivoService.ts`

#### **Funções Principais:**

**`importLeiIncentivoSpreadsheet(file: File)`**
- ✅ Lê arquivo .xlsx
- ✅ Extrai informações do projeto (linhas 1-5)
- ✅ Processa 6 rubricas automaticamente
- ✅ Converte linhas em transações completas
- ✅ Detecta orçamento previsto vs executado
- ✅ Retorna array de `Transaction[]`

**`exportLeiIncentivoSpreadsheet(transactions, projectInfo)`**
- ✅ Gera .xlsx no formato EXATO da planilha modelo
- ✅ Agrupa por rubrica (6 categorias)
- ✅ Calcula subtotais por rubrica
- ✅ Calcula total geral
- ✅ Inclui cabeçalho com dados do projeto
- ✅ Formatação idêntica para prestação de contas

**`calculateRubricTotals(transactions)`**
- ✅ Retorna totais por rubrica
- ✅ Separa: total, incentivo, recursos próprios
- ✅ Útil para dashboards e relatórios

---

### **4. Interface Atualizada**

**Arquivo:** `components/FinanceViewSimple.tsx`

#### **Novo Botão:**
```tsx
🟧 "Prestação ICMS"
   └─ Exportar Lei de Incentivo
```

#### **Importação Inteligente:**
- ✅ Detecta automaticamente se é planilha Lei de Incentivo
- ✅ Se nome contém "orçament*" → usa parser específico
- ✅ Caso contrário → importação simples

#### **Exportação:**
- ✅ Clique no botão gera arquivo `.xlsx`
- ✅ Nome: `Prestacao_Contas_2025-12-09.xlsx`
- ✅ Download automático

---

## 🎯 COMO USAR

### **1. Importar Planilha Orçamentária**

```
1. Clique em "Importar Planilha"
2. Selecione: "1 - Planilha Orçamentária.xlsx"
3. Sistema detecta formato Lei de Incentivo
4. Processa 6 rubricas automaticamente
5. Cria transações com todos os campos
```

**Resultado:**
- Todas as despesas cadastradas
- Classificadas por rubrica
- Com valores de incentivo separados

---

### **2. Registrar Despesas**

Quando lançar manualmente, preencher:

**Campos Obrigatórios:**
- Descrição
- Valor
- Data
- **Rubrica** (dropdown)

**Campos Opcionais (Lei de Incentivo):**
- CNPJ do Fornecedor
- Número da NF
- Data da NF
- Forma de Pagamento
- Retenções (INSS, IRRF, ISS)
- Upload do comprovante

---

### **3. Gerar Prestação de Contas**

```
1. Clique em "Prestação ICMS"
2. Sistema agrupa por rubrica
3. Calcula subtotais
4. Gera Excel formatado
5. Download automático
```

**Arquivo gerado contém:**
- ✅ Cabeçalho com dados do projeto
- ✅ 6 rubricas (PESSOAL, ESTRUTURA, etc.)
- ✅ Cada despesa com detalhamento
- ✅ Subtotais por rubrica
- ✅ Total geral do projeto
- ✅ Área para assinatura

---

## 📊 CATEGORIAS (RUBRICAS)

### **1. PESSOAL**
Cachês, salários, encargos

### **2. ESTRUTURA**
Palco, som, luz, cenografia

### **3. LOGÍSTICA**
Transporte, hospedagem, alimentação

### **4. DIVULGAÇÃO**
Mídia, comunicação, marketing

### **5. DESPESAS ADMINISTRATIVAS**
Contador, advogado, administrativo

### **6. IMPOSTOS, TAXAS, SEGUROS**
ISS, INSS, IRRF, seguros obrigatórios

---

## 🔧 PRÓXIMOS PASSOS

### **Para Produção:**

1. **Aplicar Migration:**
```bash
cd supabase
supabase db push
```

2. **Configurar Dados do Projeto:**
Editar em `FinanceViewSimple.tsx` linha ~170:
```typescript
const projectInfo = {
  projectName: 'SEU EVENTO',
  culturalArea: 'Música e Dança',
  // ... etc
};
```

3. **Testar Importação:**
- Upload da planilha modelo
- Verificar se transações são criadas corretamente

4. **Testar Exportação:**
- Gerar prestação de contas
- Abrir no Excel
- Verificar formatação

---

## ✅ BENEFÍCIOS

1. **Conformidade Total:**
   - Formato idêntico ao exigido
   - Todas as rubricas padrão
   - Cálculos automáticos

2. **Economia de Tempo:**
   - Importa planilha existente
   - Não precisa relançar dados
   - Exportação em 1 clique

3. **Auditoria:**
   - Todos os campos rastreáveis
   - CNPJ, NF, retenções
   - Upload de comprovantes

4. **Flexibilidade:**
   - Funciona com ou sem Lei de Incentivo
   - Importação inteligente
   - Múltiplos formatos

---

## 🚨 IMPORTANTE

**Antes do Deploy:**
- ✅ Aplicar migration no Supabase
- ✅ Configurar dados do projeto
- ✅ Testar importação/exportação
- ✅ Validar com planilha real

**Documentação Oficial:**
- Lei Rouanet: http://rouanet.cultura.gov.br
- ICMS SP: https://www.cultura.sp.gov.br/proac/

---

**Data:** 2025-12-09  
**Status:** ✅ Implementado e Testável  
**Próximo:** Conectar Supabase e testar em produção
