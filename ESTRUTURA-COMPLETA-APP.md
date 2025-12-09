# 📋 ESTRUTURA COMPLETA DO APP - BXD EVENT MANAGER

## 🎯 RESUMO EXECUTIVO
Sistema completo de gestão de eventos/campanhas com 18+ módulos integrados.

---

## 📦 MÓDULOS DISPONÍVEIS

### ✅ MÓDULOS CORE (Sempre Ativos)
1. **Dashboard** 📊
   - Visão geral financeira
   - Widgets personalizáveis
   - Alertas de inventário
   - KPIs em tempo real

2. **Perfil do Evento** 🎪
   - Informações básicas
   - Logo e identidade visual
   - Patrocinadores
   - Status de licenças

3. **Configurações** ⚙️
   - Ativar/desativar módulos
   - Personalização
   - Preferências do sistema

---

### 💰 MÓDULOS FINANCEIROS

4. **Finanças Básicas** 💵
   - Orçamento total
   - Gastos do dia
   - Saldo disponível
   - Categorias de despesas
   - Transações recentes

5. **Finanças Avançadas** 📈
   - Projeções financeiras
   - Análise de ROI
   - Relatórios detalhados
   - Fluxo de caixa

6. **Contador IA** 🤖
   - Assessoria contábil com IA
   - Sugestões de economia
   - Alertas de compliance fiscal

---

### 📅 MÓDULOS DE PLANEJAMENTO

7. **Agenda/Calendário** 📆
   - Eventos do cronograma
   - Gestão de logística
   - Previsão do tempo
   - Checklist de materiais
   - Equipe necessária

8. **Event Canvas** 🎨
   - Planejamento visual colaborativo
   - Frames, Stickies, AI Cards
   - Múltiplos espaços de trabalho
   - Renderização 3D (desativado temporariamente)

9. **Planejador 3D** 🏗️
   - Planta baixa 3D do evento
   - Posicionamento de estruturas
   - **TEMPORARIAMENTE DESATIVADO** (falta Three.js)

---

### 👥 MÓDULOS DE PESSOAS

10. **Equipe/Team** 👨‍💼
    - Membros da equipe
    - Funções e contatos
    - Status (ativo/ocupado/offline)
    - Fotos de perfil

11. **Gestão de Staff** 🎭
    - Coordenação de funcionários
    - Escalas de trabalho
    - Horas trabalhadas

12. **Voluntários** 🤝
    - Cadastro de voluntários
    - Distribuição de tarefas
    - Controle de presença

13. **CRM** 📇
    - Gestão de contatos
    - Leads e prospects
    - Histórico de interações
    - Funil de vendas

---

### 📢 MÓDULOS DE MARKETING

14. **Marketing Board** 🎯
    - Kanban de tarefas
    - Briefing → Criação → Aprovação → Publicação
    - Métricas de alcance
    - Gestão de vídeos

15. **Marketing Avançado** 🚀
    - Campanhas digitais
    - Impulsionamento
    - Analytics de ROI
    - A/B Testing

16. **Pesquisas/Enquetes** 📊
    - Criar enquetes
    - Coletar feedback
    - Análise de resultados

---

### 📊 MÓDULOS DE ANÁLISE

17. **Analytics** 📈
    - Dados de público
    - Métricas de engajamento
    - Relatórios visuais
    - Dashboards customizados

18. **Eco Gestão** ♻️
    - Sustentabilidade
    - Impacto ambiental
    - Metas ESG

---

### 🚗 MÓDULOS DE LOGÍSTICA

19. **Frota/Fleet** 🚙
    - Veículos cadastrados
    - Quilometragem
    - Abastecimentos (OCR de nota fiscal)
    - Manutenção preventiva

20. **Inventário** 📦
    - Materiais disponíveis
    - Alertas de estoque baixo
    - Localização de itens
    - Tipos: Material, Combustível, Alimentação

---

### ⚖️ MÓDULOS JURÍDICOS

21. **Assessor Jurídico IA** 👔
    - Consultoria jurídica com IA
    - Análise de contratos
    - Orientações legais

22. **Compliance** 📋
    - Conformidade legal
    - Licenças e alvarás
    - Documentação obrigatória
    - Checklists regulatórios

---

## 🎨 COMPONENTES PRINCIPAIS

### Header.tsx
- Navegação entre módulos
- Logo do evento
- Menu principal

### FinancialStats.tsx
- Cartões de KPIs financeiros
- Gráficos de despesas
- Indicadores visuais

### DashboardWidgets.tsx
- Widgets do dashboard
- Mapa de localizações
- Estatísticas digitais

### InventoryAlert.tsx
- Alertas de estoque baixo
- Notificações urgentes

### Fab.tsx (Floating Action Button)
- Botão de ações rápidas
- Menu flutuante

### ModuleGate.tsx
- Controla acesso aos módulos
- Mostra quando módulo está desativado

### ModuleShowcasePanel.tsx
- Painel de ativação de módulos
- Preview de funcionalidades

---

## 📊 DADOS E TIPOS

### types.ts - Principais interfaces:
```typescript
- FinancialKPI (orçamento, gastos, saldo)
- ExpenseCategory (categorias de despesas)
- InventoryItem (itens do estoque)
- CampaignLocation (locais/regiões)
- Task (tarefas de marketing)
- CalendarEvent (eventos da agenda)
- Transaction (transações financeiras)
- TeamMember (membros da equipe)
- Vehicle (veículos da frota)
- FuelLog (abastecimentos)
- EventProfile (perfil do evento)
- CanvasSpace, CanvasNode (Event Canvas)
```

---

## 🔌 SERVIÇOS (services/)

### dataService.ts
- Fetch de dados da campanha
- Integração com Supabase

### budgetService.ts
- Cálculos financeiros
- Lógica de orçamento

### geminiService.ts
- Integração com Google Gemini AI
- Assessoria jurídica/contábil

### exportService.ts
- Exportação de relatórios
- PDF, Excel, CSV

### importService.ts
- Importação de planilhas
- Parser de dados

### notificationService.ts
- Sistema de notificações
- Toast messages

### supabaseClient.ts
- Cliente Supabase configurado
- Autenticação e queries

---

## 🗄️ BANCO DE DADOS (Supabase)

### Tabelas Principais:
```sql
campaigns                  -- Campanhas/eventos
candidate_profiles         -- Perfis dos candidatos/organizadores
campaign_financials        -- Dados financeiros
expense_categories         -- Categorias de despesas
campaign_locations         -- Locais/regiões
digital_metrics           -- Métricas digitais
inventory_items           -- Itens do inventário
tasks                     -- Tarefas de marketing
events                    -- Eventos da agenda
transactions              -- Transações financeiras
team_members              -- Membros da equipe
module_flags              -- Controle de módulos ativos
profiles                  -- Perfis de usuários (auth)
```

---

## 🎯 DADOS DEMO ATUAIS

### Evento Exemplo:
**Nome:** Aurora Live Festival  
**Tipo:** Festival Híbrido  
**Organizador:** Produtora Lumina  
**Orçamento:** R$ 500.000  
**Gasto Total:** R$ 355.000  
**Saldo:** R$ 145.000  

### Equipe:
- Ana Silva (Produtora Executiva)
- Carlos Souza (Coord. Logística)
- Fernanda Rocha (Compliance)

### Veículos:
- Sprinter Técnica (XPT-2024)
- Truck PA (PAW-9088)
- SUV Produção (HZN-4455)

### Eventos na Agenda:
- Soundcheck Main Stage (hoje)
- Painel Futuro da Música (amanhã)

---

## 🚀 TECNOLOGIAS

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React (ícones)
- **Backend:** Supabase (PostgreSQL)
- **IA:** Google Gemini AI
- **Deploy:** Vercel
- **Build:** Vite
- **Controle de versão:** Git + GitHub

---

## 📝 STATUS ATUAL DOS ARQUIVOS

### ✅ Arquivo Original (COMPLETO):
- `App-backup.tsx` - 876 linhas
- Todos os 22 módulos funcionais
- Dados demo do Festival Aurora

### ⚠️ Arquivos de Teste (TEMPORÁRIOS):
- `App.tsx` - Versão simplificada (teste)
- `index.html` - HTML puro (teste)
- `index.tsx` - React básico (teste)

### 🗑️ Arquivos para Ignorar:
- `App-BROKEN.tsx`
- `App-SIMPLE.tsx`
- `App-MEGA-SIMPLE.tsx`
- `App-FAILED.tsx`

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Restaurar app original:**
   - Copiar `App-backup.tsx` → `App.tsx`
   - Restaurar `index.html` e `index.tsx` para React

2. **Substituir dados demo:**
   - Trocar "Aurora Live Festival" por dados reais
   - Atualizar equipe, orçamento, eventos

3. **Conectar Supabase:**
   - Verificar variáveis de ambiente
   - Testar conexão com banco

4. **Deploy no Vercel:**
   - Importar do GitHub
   - Adicionar variáveis de ambiente
   - Build e publicar

---

## 💡 NOTAS IMPORTANTES

- **EventPlanner3D está desativado** (falta instalar Three.js)
- **Todos os outros módulos funcionam perfeitamente**
- **Sistema usa dados MOCK até conectar Supabase**
- **Supabase já tem schema e dados demo prontos**

---

## 🎨 TEMAS E CORES

- **Roxo:** `#667eea` → `#764ba2` (gradiente principal)
- **Azul:** `#3b82f6` (produção técnica)
- **Amarelo:** `#f59e0b` (infraestrutura)
- **Verde:** `#10b981` (experiência)
- **Roxo secundário:** `#8b5cf6` (marketing)

---

**📌 CONCLUSÃO:** 
O app é um **sistema profissional completo** de gestão de eventos com:
- 22 módulos especializados
- Integração com IA (Gemini)
- Banco de dados robusto (Supabase)
- Interface moderna e responsiva
- Sistema de controle de acesso por módulo

**Pronto para produção após restaurar arquivos originais!**
