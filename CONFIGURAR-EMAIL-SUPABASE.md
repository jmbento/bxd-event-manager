# 📧 Configurar Email Templates Personalizados no Supabase

## 🎯 Objetivo
Substituir os emails básicos do Supabase por templates profissionais com a marca BXD Event Manager.

---

## 🔧 Como Configurar

### 1️⃣ Acessar Configurações de Email

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard/project/hzgzobcjdgddtrfzbywg
2. No menu lateral, vá em **Authentication** → **Email Templates**
3. Você verá 4 tipos de emails para personalizar:
   - **Confirm signup** (Email de confirmação de cadastro)
   - **Magic Link** (Link mágico para login)
   - **Change Email Address** (Mudança de email)
   - **Reset Password** (Recuperação de senha)

---

## 📨 Templates Personalizados

### 🎨 Template: Confirm Signup (Email de Confirmação)

**Subject (Assunto):**
```
Bem-vindo ao BXD Event Manager - Confirme seu email
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>🎉 Bem-vindo ao BXD Event Manager!</h1>
      </div>
      
      <div class="content">
        <p>Olá!</p>
        
        <p>Obrigado por se cadastrar no <strong>BXD Event Manager</strong> - a plataforma completa para gestão profissional de eventos.</p>
        
        <p>Para começar a usar todas as funcionalidades da sua conta <strong>PRO</strong> (trial de 15 dias), confirme seu email clicando no botão abaixo:</p>
        
        <div style="text-align: center;">
          <a href="{{ .ConfirmationURL }}" class="button">
            ✅ Confirmar meu Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Ou copie e cole este link no seu navegador:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p><strong>O que você terá acesso:</strong></p>
        <ul style="line-height: 1.8;">
          <li>📊 Dashboard com KPIs em tempo real</li>
          <li>💰 Gestão financeira avançada</li>
          <li>📅 Agenda inteligente de eventos</li>
          <li>👥 CRM e gestão de equipe</li>
          <li>📈 Analytics e relatórios</li>
          <li>🎯 Marketing e automação</li>
          <li>E mais de 15 módulos profissionais!</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Precisa de ajuda? Entre em contato conosco:</p>
        <p>
          📧 <a href="mailto:suporte@bxdeventmanager.com">suporte@bxdeventmanager.com</a><br>
          🌐 <a href="https://bxd-event-manager.vercel.app">bxd-event-manager.vercel.app</a>
        </p>
        <p style="margin-top: 20px;">
          © 2025 BXD Event Manager. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

### 🔗 Template: Magic Link (Login sem senha)

**Subject (Assunto):**
```
Seu link de acesso ao BXD Event Manager
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .alert {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>🔐 Seu Link de Acesso</h1>
      </div>
      
      <div class="content">
        <p>Olá!</p>
        
        <p>Recebemos uma solicitação de acesso ao <strong>BXD Event Manager</strong> usando este email.</p>
        
        <p>Clique no botão abaixo para fazer login de forma segura (sem necessidade de senha):</p>
        
        <div style="text-align: center;">
          <a href="{{ .ConfirmationURL }}" class="button">
            🚀 Acessar minha conta
          </a>
        </div>
        
        <div class="alert">
          <p style="margin: 0; font-size: 14px;">
            <strong>⚠️ Atenção:</strong> Este link expira em 1 hora e só pode ser usado uma vez.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Ou copie e cole este link no seu navegador:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Não solicitou este acesso?</strong><br>
          Você pode ignorar este email com segurança. Ninguém acessará sua conta sem este link.
        </p>
      </div>
      
      <div class="footer">
        <p>Precisa de ajuda? Entre em contato conosco:</p>
        <p>
          📧 <a href="mailto:suporte@bxdeventmanager.com">suporte@bxdeventmanager.com</a><br>
          🌐 <a href="https://bxd-event-manager.vercel.app">bxd-event-manager.vercel.app</a>
        </p>
        <p style="margin-top: 20px;">
          © 2025 BXD Event Manager. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

### 🔄 Template: Reset Password (Recuperação de Senha)

**Subject (Assunto):**
```
Redefinição de senha - BXD Event Manager
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .alert {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>🔒 Redefinir Senha</h1>
      </div>
      
      <div class="content">
        <p>Olá!</p>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>BXD Event Manager</strong>.</p>
        
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center;">
          <a href="{{ .ConfirmationURL }}" class="button">
            🔑 Criar nova senha
          </a>
        </div>
        
        <div class="alert">
          <p style="margin: 0; font-size: 14px;">
            <strong>⚠️ Atenção:</strong> Este link expira em 1 hora por segurança.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Ou copie e cole este link no seu navegador:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Não solicitou esta alteração?</strong><br>
          Se você não pediu para redefinir sua senha, ignore este email. Sua conta permanecerá segura.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Dicas de segurança:</strong>
        </p>
        <ul style="color: #6b7280; font-size: 14px; line-height: 1.8;">
          <li>Use uma senha forte com pelo menos 8 caracteres</li>
          <li>Combine letras maiúsculas e minúsculas</li>
          <li>Inclua números e símbolos</li>
          <li>Não compartilhe sua senha com ninguém</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Precisa de ajuda? Entre em contato conosco:</p>
        <p>
          📧 <a href="mailto:suporte@bxdeventmanager.com">suporte@bxdeventmanager.com</a><br>
          🌐 <a href="https://bxd-event-manager.vercel.app">bxd-event-manager.vercel.app</a>
        </p>
        <p style="margin-top: 20px;">
          © 2025 BXD Event Manager. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 🚀 Como Aplicar os Templates

### Passo a Passo:

1. **Acesse cada template no Supabase Dashboard**
   - Authentication → Email Templates

2. **Para cada tipo de email:**
   - Copie o **Subject** e cole no campo "Subject"
   - Copie o **Body HTML** completo e cole no campo de edição
   - Clique em **Save**

3. **Teste o email:**
   - Faça um novo cadastro de teste
   - Verifique se o email chegou formatado corretamente
   - Teste todos os links

---

## ✅ Checklist de Configuração

- [ ] **Confirm Signup** - Template aplicado e testado
- [ ] **Magic Link** - Template aplicado e testado
- [ ] **Reset Password** - Template aplicado e testado
- [ ] **Change Email** - Template aplicado (opcional)
- [ ] Verificar se os links `{{ .ConfirmationURL }}` funcionam
- [ ] Testar em mobile (Gmail, Outlook, etc.)
- [ ] Testar em desktop (navegadores)
- [ ] Verificar se não cai em spam

---

## 📝 Variáveis Disponíveis no Supabase

O Supabase oferece estas variáveis nos templates:

- `{{ .ConfirmationURL }}` - Link de confirmação/ação
- `{{ .Token }}` - Token de segurança (raramente usado diretamente)
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do seu site
- `{{ .Email }}` - Email do usuário

---

## 🎨 Cores da Marca

Usadas nos templates:

- **Primário**: `#667eea` → `#764ba2` (gradient roxo)
- **Sucesso**: `#10b981` (verde)
- **Alerta**: `#f59e0b` (amarelo)
- **Erro**: `#ef4444` (vermelho)
- **Texto**: `#374151` (cinza escuro)
- **Texto secundário**: `#6b7280` (cinza médio)

---

## 🔧 Próximos Passos

Após configurar os emails:

1. ✅ Remover modo demo do código (FEITO)
2. ✅ Aplicar templates personalizados no Supabase (VOCÊ FAZ AGORA)
3. 🔄 Testar cadastro trial completo
4. 📊 Verificar se permissões PRO estão funcionando
5. 🚀 Liberar para testadores reais

---

## 📧 Contato de Suporte

Configure também o email de remetente:

1. No Supabase Dashboard → Authentication → Settings
2. Configure **SMTP Settings** (opcional, para usar seu domínio)
3. Ou use o email padrão do Supabase: `noreply@mail.app.supabase.io`

---

**Pronto!** Com estes templates, seus usuários terão uma experiência profissional desde o primeiro contato. 🚀
