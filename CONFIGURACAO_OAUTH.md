# Configuração de Login Social (OAuth)

Este guia mostra como configurar autenticação com Google e GitHub no Supabase para o BXD Event Manager.

## ✅ Mudanças Implementadas

- ✅ Botões de login com Google e GitHub adicionados em `Auth.tsx`
- ✅ Botões de login com Google e GitHub já existentes em `AuthPage.tsx`
- ✅ Função `handleOAuthLogin()` implementada nos dois componentes
- ✅ Redirect configurado para `/auth/callback`

## 🔧 Configuração no Supabase

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto: `hzgzobcjdgddtrfzbywg`
3. Vá em **Authentication** → **Providers**

---

## 🔴 Google OAuth

### 1. Criar Credenciais no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Configure a tela de consentimento (OAuth consent screen) se necessário:
   - User Type: **External**
   - App name: `BXD Event Manager`
   - User support email: seu email
   - Developer contact: seu email

### 2. Configurar OAuth Client ID

1. Application type: **Web application**
2. Name: `BXD Event Manager`
3. **Authorized JavaScript origins:**
   ```
   https://hzgzobcjdgddtrfzbywg.supabase.co
   http://localhost:3001
   ```
4. **Authorized redirect URIs:**
   ```
   https://hzgzobcjdgddtrfzbywg.supabase.co/auth/v1/callback
   http://localhost:3001/auth/callback
   ```
5. Clique em **Create**
6. Copie o **Client ID** e **Client Secret**

### 3. Configurar no Supabase

1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Encontre **Google** e clique em **Enable**
3. Cole o **Client ID** e **Client Secret** do Google
4. Em **Redirect URL**, use:
   ```
   https://hzgzobcjdgddtrfzbywg.supabase.co/auth/v1/callback
   ```
5. Clique em **Save**

---

## ⚫ GitHub OAuth

### 1. Criar OAuth App no GitHub

1. Acesse: https://github.com/settings/developers
2. Clique em **New OAuth App**
3. Preencha:
   - **Application name:** `BXD Event Manager`
   - **Homepage URL:** `https://hzgzobcjdgddtrfzbywg.supabase.co`
   - **Authorization callback URL:**
     ```
     https://hzgzobcjdgddtrfzbywg.supabase.co/auth/v1/callback
     ```
4. Clique em **Register application**
5. Copie o **Client ID**
6. Clique em **Generate a new client secret** e copie o **Client Secret**

### 2. Configurar no Supabase

1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Encontre **GitHub** e clique em **Enable**
3. Cole o **Client ID** e **Client Secret** do GitHub
4. Clique em **Save**

---

## 🌐 URLs de Redirect

### Produção (Vercel)
Quando fizer deploy na Vercel, adicione também estas URLs:

**Google:**
```
https://seu-dominio.vercel.app/auth/callback
```

**GitHub:**
```
https://seu-dominio.vercel.app/auth/callback
```

### Desenvolvimento Local
```
http://localhost:3001/auth/callback
```

---

## 🧪 Testar Localmente

1. Certifique-se de que o servidor está rodando:
   ```bash
   npm run dev
   ```

2. Abra: http://localhost:3001

3. Clique em **Google** ou **GitHub**

4. Você será redirecionado para a página de autorização

5. Após autorizar, voltará para o app autenticado

---

## ⚠️ Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirect estão exatamente iguais no Google/GitHub e no Supabase

### Erro: "OAuth provider not enabled"
- Certifique-se de que habilitou o provider no Supabase Dashboard

### Usuário autenticado mas não aparece no dashboard
- Verifique a função `onSuccess()` nos componentes Auth.tsx e AuthPage.tsx
- Confirme que a sessão está sendo salva corretamente

### Erro no localhost
- Adicione `http://localhost:3001` nas URLs autorizadas do Google/GitHub

---

## 📱 Fluxo de Autenticação

1. Usuário clica no botão "Google" ou "GitHub"
2. `handleOAuthLogin()` é chamada
3. Supabase redireciona para o provedor OAuth
4. Usuário autoriza o app
5. Provedor redireciona de volta para `/auth/callback`
6. Supabase processa o token e cria a sessão
7. App chama `onSuccess()` e redireciona para o dashboard

---

## 🔐 Segurança

- As chaves OAuth nunca são expostas no frontend
- Tokens são gerenciados automaticamente pelo Supabase
- Use HTTPS em produção
- Nunca commite Client Secrets no git

---

## 📚 Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
