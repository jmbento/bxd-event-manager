# 🏷️ Sistema de Pulseiras NFC - BXD Event Manager

Sistema completo de gestão de pulseiras NFC/RFID para eventos, incluindo controle de acesso, pagamentos cashless e coleta de leads para marketing.

---

## 📋 Índice

- [Arquitetura Geral](#arquitetura-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Modelo de Dados](#modelo-de-dados)
- [API Reference](#api-reference)
- [Fluxos Principais](#fluxos-principais)
- [Setup e Instalação](#setup-e-instalação)
- [Segurança e LGPD](#segurança-e-lgpd)

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITETURA DO SISTEMA                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                      │
│  │  Staff App   │    │   Web Panel  │    │  Totens/PDV  │                      │
│  │  (Flutter)   │    │   (React)    │    │  (Terminal)  │                      │
│  │              │    │              │    │              │                      │
│  │ • Check-in   │    │ • Dashboard  │    │ • Consumo    │                      │
│  │ • Ativação   │    │ • Relatórios │    │ • Recarga    │                      │
│  │ • Consultas  │    │ • Gestão     │    │ • Estorno    │                      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                   │                              │
│         └───────────────────┼───────────────────┘                              │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌────────────────┐                                          │
│                    │   API Gateway  │                                          │
│                    │   (Express.js) │                                          │
│                    │                │                                          │
│                    │ • Rate Limit   │                                          │
│                    │ • JWT Auth     │                                          │
│                    │ • Validation   │                                          │
│                    │ • CORS         │                                          │
│                    └────────┬───────┘                                          │
│                             │                                                  │
│         ┌───────────────────┼───────────────────┐                              │
│         ▼                   ▼                   ▼                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │
│  │  Attendee   │    │  Wristband  │    │ Transaction │                        │
│  │  Service    │    │  Service    │    │  Service    │                        │
│  └─────────────┘    └─────────────┘    └─────────────┘                        │
│         │                   │                   │                              │
│         │                   │                   │                              │
│         ▼                   ▼                   ▼                              │
│  ┌─────────────────────────────────────────────────────┐                      │
│  │                     SUPABASE                        │                      │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │                      │
│  │  │ PostgreSQL│ │   Auth    │ │   Row Level       │  │                      │
│  │  │  Database │ │  (futuro) │ │   Security        │  │                      │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │                      │
│  └─────────────────────────────────────────────────────┘                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE CREDENCIAMENTO                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ① IMPORTAÇÃO           ② ATIVAÇÃO             ③ ENTRADA                       │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐                 │
│  │   CSV/API   │   ──►  │   Balcão    │   ──►  │   Portão    │                 │
│  │  Ingressos  │        │  Credencia- │        │   Catraca   │                 │
│  │             │        │  mento      │        │             │                 │
│  └─────────────┘        └─────────────┘        └─────────────┘                 │
│        │                       │                      │                        │
│        ▼                       ▼                      ▼                        │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐                 │
│  │  attendees  │   ◄──  │  wristbands │   ──►  │ access_logs │                 │
│  │   (leads)   │        │  accounts   │        │             │                 │
│  └─────────────┘        └─────────────┘        └─────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FLUXO CASHLESS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   RECARGA                  CONSUMO                 ESTORNO                      │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐                 │
│  │   Caixa     │        │    Bar/     │        │   Suporte   │                 │
│  │             │        │   Loja      │        │             │                 │
│  └──────┬──────┘        └──────┬──────┘        └──────┬──────┘                 │
│         │                      │                      │                        │
│         │ POST /topup          │ POST /purchase       │ POST /refund           │
│         ▼                      ▼                      ▼                        │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │                       accounts.balance                          │           │
│  │                                                                 │           │
│  │   + topup    ──►    saldo    ◄──    - purchase                  │           │
│  │                        │                                        │           │
│  │                        │ refund (+)                             │           │
│  │                        ▼                                        │           │
│  │                   transactions                                  │           │
│  │                   (histórico)                                   │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|------------|-----------|
| **Backend API** | Node.js + Express | Servidor REST com middleware de segurança |
| **Banco de Dados** | PostgreSQL (Supabase) | Banco relacional com Row Level Security |
| **Autenticação** | JWT + bcrypt | Tokens seguros para staff |
| **Staff Mobile** | Flutter | App para leitura NFC e operações |
| **Web Panel** | React + TypeScript | Dashboard administrativo |
| **NFC Hardware** | Leitores USB/Bluetooth | Compatível com NTAG213/215, MIFARE |

---

## 📊 Modelo de Dados

### Diagrama ER

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│     attendees     │       │    wristbands     │       │     accounts      │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (PK, UUID)     │◄──────│ attendee_id (FK)  │──────►│ wristband_id (FK) │
│ full_name         │       │ id (PK, UUID)     │       │ id (PK, UUID)     │
│ email             │       │ uid (UNIQUE)      │       │ balance_cents     │
│ phone             │       │ status            │       │ last_topup_at     │
│ cpf               │       │ activated_at      │       │ created_at        │
│ age               │       │ created_at        │       │ updated_at        │
│ city              │       │ updated_at        │       └─────────┬─────────┘
│ state             │       └─────────┬─────────┘                 │
│ ticket_type       │                 │                           │
│ marketing_opt_in  │                 │                           │
│ created_at        │                 │                           │
│ updated_at        │                 ▼                           ▼
└───────────────────┘       ┌───────────────────┐       ┌───────────────────┐
                            │   access_logs     │       │   transactions    │
                            ├───────────────────┤       ├───────────────────┤
                            │ id (PK, UUID)     │       │ id (PK, UUID)     │
                            │ wristband_id (FK) │       │ account_id (FK)   │
                            │ gate              │       │ type (ENUM)       │
                            │ direction (in/out)│       │ amount_cents      │
                            │ status            │       │ description       │
                            │ reason            │       │ reference_id      │
                            │ operator_id       │       │ operator_id       │
                            │ device_id         │       │ device_id         │
                            │ created_at        │       │ created_at        │
                            └───────────────────┘       └───────────────────┘
```

### Status das Pulseiras

| Status | Descrição | Pode entrar? | Pode consumir? |
|--------|-----------|--------------|----------------|
| `new` | Pulseira nova, não ativada | ❌ | ❌ |
| `assigned` | Vinculada a participante | ✅ | ✅ |
| `blocked` | Bloqueada (perda, roubo) | ❌ | ❌ |
| `lost` | Reportada como perdida | ❌ | ❌ |

---

## 📡 API Reference

### Base URL

```
http://localhost:3001/api
```

### Autenticação

Todas as rotas (exceto `/auth/login`) requerem header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### 🔐 Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login do staff |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Renovar token |

**Login Request:**
```json
{
  "email": "operador@evento.com",
  "password": "senha123"
}
```

---

#### 👥 Participantes (Leads)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/attendees` | Lista participantes (paginado) |
| GET | `/attendees/:id` | Detalhes de um participante |
| POST | `/attendees` | Criar participante |
| PUT | `/attendees/:id` | Atualizar participante |
| DELETE | `/attendees/:id` | Remover participante |
| GET | `/attendees/search` | Busca por nome/email/cpf |

**Criar Participante:**
```json
{
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999998888",
  "cpf": "123.456.789-00",
  "age": 28,
  "city": "São Paulo",
  "state": "SP",
  "ticket_type": "vip",
  "marketing_opt_in": true
}
```

---

#### 🏷️ Pulseiras

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/wristbands` | Lista pulseiras |
| GET | `/wristbands/:uid` | Buscar por UID |
| POST | `/wristbands` | Cadastrar nova pulseira |
| POST | `/wristbands/activate` | Ativar e vincular a participante |
| PUT | `/wristbands/:uid/block` | Bloquear pulseira |
| PUT | `/wristbands/:uid/unblock` | Desbloquear pulseira |
| GET | `/wristbands/:uid/status` | Status completo |

**Ativar Pulseira:**
```json
{
  "uid": "NFC001ABC",
  "attendee_id": "uuid-do-participante"
}
```

---

#### 🚪 Controle de Acesso

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/access-logs/check-in` | Registrar entrada/saída |
| GET | `/access-logs/history` | Histórico de acessos |
| GET | `/access-logs/stats` | Estatísticas por portão |

**Check-in:**
```json
{
  "uid": "NFC001ABC",
  "gate": "Entrada Principal",
  "direction": "in",
  "device_id": "CATRACA-01"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "attendee": {
      "name": "João Silva",
      "ticket_type": "vip"
    },
    "access_log_id": "uuid"
  }
}
```

---

#### 💳 Cashless

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/transactions/topup` | Recarga de saldo |
| POST | `/transactions/purchase` | Débito (consumo) |
| POST | `/transactions/refund` | Estorno |
| GET | `/accounts/:uid/balance` | Consultar saldo |
| GET | `/accounts/:uid/statement` | Extrato |

**Recarga:**
```json
{
  "uid": "NFC001ABC",
  "amount_cents": 10000,
  "payment_method": "credit_card",
  "reference_id": "PIX-123456"
}
```

**Consumo:**
```json
{
  "uid": "NFC001ABC",
  "amount_cents": 2500,
  "description": "2x Cerveja 600ml",
  "pos_id": "BAR-01"
}
```

**Resposta Saldo:**
```json
{
  "success": true,
  "data": {
    "uid": "NFC001ABC",
    "attendee_name": "João Silva",
    "balance_cents": 7500,
    "balance_formatted": "R$ 75,00",
    "last_topup_at": "2025-12-10T15:30:00Z"
  }
}
```

---

#### 📊 Relatórios

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/reports/leads` | Leads para marketing |
| GET | `/reports/financials` | Resumo financeiro |
| GET | `/reports/access` | Estatísticas de acesso |

**Filtros de Leads:**
```
GET /reports/leads?city=São Paulo&min_age=18&max_age=35&min_spent=5000&opt_in=true
```

---

## 🔄 Fluxos Principais

### 1️⃣ Credenciamento (Ativação de Pulseira)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Staff     │     │    App      │     │    API      │     │   Database  │
│  (operador) │     │  (Flutter)  │     │  (Express)  │     │ (Supabase)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Lê pulseira    │                   │                   │
       │──────────────────►│                   │                   │
       │                   │                   │                   │
       │                   │ 2. GET /wristband │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 3. SELECT         │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │◄──────────────────│                   │
       │                   │                   │                   │
       │ 4. Cadastra dados │                   │                   │
       │   (nome, email)   │                   │                   │
       │──────────────────►│                   │                   │
       │                   │                   │                   │
       │                   │ 5. POST /activate │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 6. INSERT/UPDATE  │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │◄──────────────────│                   │
       │                   │                   │                   │
       │ 7. Sucesso!       │                   │                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
```

### 2️⃣ Check-in no Portão

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Catraca    │     │    API      │     │   Service   │     │   Database  │
│   (NFC)     │     │  (Express)  │     │  (Access)   │     │ (Supabase)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. POST /check-in │                   │                   │
       │   {uid, gate}     │                   │                   │
       │──────────────────►│                   │                   │
       │                   │                   │                   │
       │                   │ 2. checkIn()      │                   │
       │                   │──────────────────►│                   │
       │                   │                   │                   │
       │                   │                   │ 3. Busca pulseira │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │                   │                   │
       │                   │                   │ 4. Valida status  │
       │                   │                   │   (assigned?)     │
       │                   │                   │                   │
       │                   │                   │ 5. INSERT log     │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │                   │                   │
       │                   │◄──────────────────│                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 6. allowed: true  │                   │                   │
       │   → Abre catraca  │                   │                   │
       │                   │                   │                   │
```

### 3️⃣ Compra Cashless

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PDV      │     │    API      │     │  Service    │     │   Database  │
│  (Bar/Loja) │     │  (Express)  │     │(Transaction)│     │ (Supabase)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. POST /purchase │                   │                   │
       │   {uid, R$25}     │                   │                   │
       │──────────────────►│                   │                   │
       │                   │                   │                   │
       │                   │ 2. purchase()     │                   │
       │                   │──────────────────►│                   │
       │                   │                   │                   │
       │                   │                   │ 3. Busca account  │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │                   │                   │
       │                   │                   │ 4. Verifica saldo │
       │                   │                   │   >= R$25?        │
       │                   │                   │                   │
       │                   │                   │ 5. UPDATE balance │
       │                   │                   │   balance -= 2500 │
       │                   │                   │──────────────────►│
       │                   │                   │                   │
       │                   │                   │ 6. INSERT trans.  │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │                   │                   │
       │                   │◄──────────────────│                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 7. success: true  │                   │                   │
       │   novo_saldo: R$50│                   │                   │
       │                   │                   │                   │
```

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Leitores NFC compatíveis

### 1. Clone e Instale

```bash
cd nfc-backend
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key

# JWT
JWT_SECRET=sua-chave-secreta-muito-longa
JWT_EXPIRES_IN=8h

# Server
PORT=3001
NODE_ENV=development
```

### 3. Execute o Schema no Supabase

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Cole o conteúdo de `database/schema.sql`
3. Execute

### 4. Inicie o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 5. Teste a API

```bash
# Health check
curl http://localhost:3001/health

# Login (criar usuário staff primeiro via Supabase)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evento.com","password":"senha123"}'
```

---

## 🔒 Segurança e LGPD

### Medidas Implementadas

1. **Autenticação JWT**
   - Tokens expiram em 8h
   - Refresh tokens disponíveis
   - bcrypt para senhas

2. **Rate Limiting**
   - 100 requests/15min por IP
   - Proteção contra brute force

3. **Validação de Dados**
   - express-validator em todas as rotas
   - Sanitização de inputs

4. **CORS Configurável**
   - Whitelist de origens permitidas

5. **Helmet.js**
   - Headers de segurança HTTP

### LGPD Compliance

| Requisito | Implementação |
|-----------|---------------|
| **Consentimento** | Campo `marketing_opt_in` obrigatório |
| **Acesso aos Dados** | Endpoint GET `/attendees/:id` |
| **Portabilidade** | Endpoint de exportação JSON |
| **Exclusão** | Endpoint DELETE com anonimização |
| **Minimização** | Apenas dados necessários coletados |

### Anonimização de Dados

Para LGPD, o DELETE não remove o registro, mas anonimiza:

```sql
UPDATE attendees 
SET 
  full_name = 'REMOVIDO',
  email = NULL,
  phone = NULL,
  cpf = NULL,
  anonymized_at = NOW()
WHERE id = $1;
```

---

## 📱 Integração Mobile (Flutter)

Ver arquivo `flutter_examples/` para código de referência:

- `lib/services/nfc_api_service.dart` - Cliente HTTP
- `lib/screens/activation_screen.dart` - Tela de ativação
- `lib/screens/checkin_screen.dart` - Tela de check-in
- `lib/screens/balance_screen.dart` - Consulta de saldo

---

## 📈 Métricas e Monitoramento

### Logs Estruturados

```javascript
// Cada operação gera log com:
{
  timestamp: "2025-12-10T15:30:00Z",
  level: "info",
  operation: "check-in",
  uid: "NFC001ABC",
  gate: "Entrada Principal",
  result: "allowed",
  latency_ms: 45,
  operator_id: "uuid"
}
```

### Health Check

```
GET /health

{
  "status": "ok",
  "timestamp": "2025-12-10T15:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Proprietário - BXD Power Event © 2025
