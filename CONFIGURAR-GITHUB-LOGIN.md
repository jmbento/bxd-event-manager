# 🔐 Configurar Login com GitHub no Supabase

## 🎯 Status Atual

✅ **Código já configurado** - O botão de login GitHub já está implementado no app
⚠️ **Falta configurar** - Credenciais OAuth no Supabase Dashboard

---

## 📋 Passo a Passo para Configurar

### 1️⃣ Criar OAuth App no GitHub

1. **Acesse**: https://github.com/settings/developers
2. **Clique**: "OAuth Apps" no menu lateral
3. **Clique**: "New OAuth App"
4. **Preencha os campos**:

   **Application name:**
   ```
   BXD Event Manager
   ```

   **Homepage URL:**
   ```
   https://bxd-event-manager.vercel.app
   ```

   **Application description:**
   ```
   Plataforma completa para gestão profissional de eventos
   ```

   **Authorization callback URL:** (IMPORTANTE!)
   ```
   https://hzgzobcjdgddtrfzbywg.supabase.co/auth/v1/callback
   ```

5. **Clique**: "Register application"

6. **Copie as credenciais**:
   - 📋 **Client ID** (visível na tela)
   - 🔑 **Client Secret** (clique em "Generate a new client secret")

⚠️ **ATENÇÃO**: Salve o Client Secret imediatamente - você não poderá vê-lo novamente!

---

### 2️⃣ Configurar no Supabase Dashboard

1. **Acesse**: https://supabase.com/dashboard/project/hzgzobcjdgddtrfzbywg
2. **Vá em**: Authentication → Providers (menu lateral)
3. **Procure**: GitHub na lista de providers
4. **Clique**: No toggle para habilitar GitHub
5. **Preencha**:
   - **GitHub enabled**: ✅ Ative o toggle
   - **Client ID**: Cole o Client ID do passo anterior
   - **Client Secret**: Cole o Client Secret do passo anterior
6. **Clique**: "Save"

---

### 3️⃣ Testar o Login do GitHub

1. **Acesse**: https://bxd-event-manager.vercel.app
2. **Clique**: "Criar conta" ou "Fazer login"
3. **Clique**: No botão "GitHub" (botão cinza com logo do GitHub)
4. **Autorize**: O acesso quando o GitHub solicitar
5. **Resultado esperado**: 
   - Redirecionamento automático para o app
   - Login realizado com sucesso
   - Dashboard exibido com seus dados do GitHub

---

## 🔍 Como Funciona (Fluxo OAuth)

```
1. Usuário clica em "Login com GitHub"
   ↓
2. App redireciona para GitHub OAuth
   ↓
3. GitHub pede autorização do usuário
   ↓
4. Usuário autoriza
   ↓
5. GitHub redireciona para Supabase callback
   ↓
6. Supabase cria/autentica o usuário
   ↓
7. App recebe o token de autenticação
   ↓
8. Dashboard é exibido
```

---

## 📝 Informações Importantes

### O que o GitHub compartilha:

- ✅ Nome completo
- ✅ Email principal
- ✅ Foto de perfil
- ✅ Username do GitHub

### O que acontece no primeiro login:

1. **Supabase cria automaticamente**:
   - Registro na tabela `auth.users`
   - Email do GitHub como identificador
   - Foto de perfil do GitHub

2. **Nosso código cria**:
   - Organização no sistema
   - Usuário no sistema de auditoria
   - Permissões baseadas no plano trial (PRO)

---

## 🚨 Troubleshooting

### Problema: "OAuth misconfigured"

**Causa**: Callback URL incorreta no GitHub
**Solução**: 
1. Vá em GitHub → Settings → Developer settings → OAuth Apps
2. Edite seu app
3. Confirme que o callback URL é exatamente:
   ```
   https://hzgzobcjdgddtrfzbywg.supabase.co/auth/v1/callback
   ```

### Problema: "Invalid client"

**Causa**: Client ID ou Secret incorretos no Supabase
**Solução**:
1. Regenere o Client Secret no GitHub
2. Copie novamente e cole no Supabase
3. Salve e teste novamente

### Problema: Email não está vindo do GitHub

**Causa**: Email privado no GitHub
**Solução**:
1. Vá em GitHub → Settings → Emails
2. Desmarque "Keep my email addresses private"
3. Ou: Configure o email público nas configurações do GitHub

### Problema: Redirect loop

**Causa**: Problema no callback do Supabase
**Solução**:
1. Limpe cookies e cache do navegador
2. Verifique se a URL do callback está correta
3. Tente em modo anônimo/privado

---

## ✅ Checklist de Configuração

- [ ] OAuth App criado no GitHub
- [ ] Client ID copiado
- [ ] Client Secret copiado e guardado
- [ ] GitHub habilitado no Supabase
- [ ] Client ID colado no Supabase
- [ ] Client Secret colado no Supabase
- [ ] Configurações salvas no Supabase
- [ ] Teste de login realizado
- [ ] Login funcionando corretamente

---

## 🔒 Segurança

### ✅ O que está seguro:

- Client Secret nunca exposto no frontend
- Callback URL validado pelo Supabase
- Tokens armazenados com segurança
- HTTPS obrigatório em produção

### ⚠️ Boas práticas:

- Nunca commitar Client Secret no Git
- Usar variáveis de ambiente para credenciais
- Revisar logs de OAuth periodicamente
- Revogar acessos não utilizados

---

## 📊 Monitoramento

### Ver logins do GitHub:

1. Acesse Supabase Dashboard
2. Vá em: Authentication → Users
3. Filtre por provider: `github`
4. Veja todos os usuários que logaram via GitHub

### Logs de autenticação:

1. Supabase Dashboard
2. Authentication → Logs
3. Filtre por `auth.signin` com provider GitHub

---

## 🎨 Customização (Opcional)

### Mudar logo do OAuth App:

1. GitHub → Settings → Developer settings → OAuth Apps
2. Clique no seu app
3. "Upload new logo"
4. Use o logo do BXD Event Manager

### Personalizar tela de autorização:

- O GitHub usa automaticamente:
  - Nome do app
  - Logo do app
  - Homepage URL
  - Descrição do app

---

## 🚀 Após Configurar

Com GitHub OAuth ativo, seus usuários podem:

1. ✅ **Cadastro rápido**: Sem preencher formulários
2. ✅ **Login sem senha**: Um clique para acessar
3. ✅ **Foto automática**: Avatar do GitHub já configurado
4. ✅ **Dados atualizados**: Sincroniza com perfil do GitHub
5. ✅ **Mais confiança**: Autenticação via plataforma conhecida

---

## 🔗 Links Úteis

- **GitHub OAuth Apps**: https://github.com/settings/developers
- **Supabase Auth**: https://supabase.com/dashboard/project/hzgzobcjdgddtrfzbywg/auth/providers
- **Docs Supabase OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-github
- **GitHub OAuth Docs**: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

---

**Pronto!** Siga este guia e o login do GitHub estará funcionando perfeitamente! 🚀
