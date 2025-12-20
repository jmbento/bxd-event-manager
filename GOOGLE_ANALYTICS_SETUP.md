# Como Configurar Google Analytics 4

## 🎯 Passo 1: Criar conta no Google Analytics

1. Acesse: https://analytics.google.com/
2. Clique em **"Começar a medir"** ou **"Admin"** (ícone de engrenagem)
3. Clique em **"Criar conta"**
   - Nome da conta: `BXD Event Manager`
   - Configure as opções de compartilhamento (deixe tudo marcado)
   - Clique em **Avançar**

## 📊 Passo 2: Criar Propriedade

1. Nome da propriedade: `BXD Event Manager - Produção`
2. Fuso horário: `(GMT-03:00) Brasília`
3. Moeda: `Real brasileiro (R$)`
4. Clique em **Avançar**

## 🏢 Passo 3: Detalhes da empresa

1. Categoria: **Tecnologia** ou **Software como serviço (SaaS)**
2. Tamanho da empresa: escolha o seu
3. Como você pretende usar o Google Analytics: marque as opções relevantes
4. Clique em **Criar**
5. Aceite os Termos de Serviço

## 🌐 Passo 4: Configurar stream de dados

1. Escolha a plataforma: **Web**
2. **URL do site:** `https://bxd-event-manager.vercel.app`
3. **Nome do stream:** `BXD Event Manager Web`
4. Marque: **"Ativar medição de página aprimorada"**
5. Clique em **Criar stream**

## 🔑 Passo 5: Copiar o ID de Medição

Após criar o stream, você verá:

```
ID DE MEDIÇÃO
G-XXXXXXXXXX
```

**Copie esse ID!**

## 💻 Passo 6: Atualizar o código

Abra o arquivo: `/components/GoogleAnalytics.tsx`

Substitua a linha 4:
```typescript
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

Por:
```typescript
const GA_MEASUREMENT_ID = 'G-SEU_ID_AQUI';  // Cole o ID que você copiou
```

## 🚀 Passo 7: Deploy

```bash
git add .
git commit -m "feat: adiciona Google Analytics"
git push
vercel --prod
```

---

## 📊 O que você vai conseguir ver no Google Analytics:

### **1. Visão Geral em Tempo Real**
- Usuários ativos agora
- Páginas sendo visualizadas
- Localizações dos usuários

### **2. Aquisição (De onde vêm os usuários)**
- Google (busca orgânica)
- Direto (digitaram a URL)
- Redes sociais
- Anúncios

### **3. Engajamento**
- Páginas mais visitadas
- Tempo na página
- Taxa de rejeição

### **4. Eventos Customizados (já configurados!)**
- ✅ Cadastros (`sign_up`)
- ✅ Logins (`login`)
- ✅ Visualizações de preço (`view_pricing`)
- ✅ Seleção de planos (`select_plan`)
- ✅ Início de trial (`start_trial`)
- ✅ Criação de eventos (`create_event`)
- ✅ Acesso a módulos (`access_module`)
- ✅ Conversões/Assinaturas (`purchase`)

### **5. Conversões**
- Taxa de conversão (visitante → trial)
- Taxa de trial → assinante
- Valor médio de assinatura

---

## 🎯 Métricas importantes para acompanhar:

### **Diário:**
- Visitantes únicos
- Novos cadastros
- Trials iniciados

### **Semanal:**
- Taxa de conversão
- Páginas mais acessadas
- Tempo médio na plataforma

### **Mensal:**
- Crescimento de usuários
- Receita (conversões)
- ROI de marketing

---

## 🔗 Links úteis:

- **Dashboard Analytics:** https://analytics.google.com/
- **App em produção:** https://bxd-event-manager.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 💡 Dica:

Configure alertas personalizados no Google Analytics para ser notificado quando:
- Houver um pico de tráfego
- Taxa de conversão cair
- Novas conversões acontecerem
