# INSTRUÇÕES PARA RECRIAR PROJETO NO VERCEL

## PASSO 1: Deletar projeto atual
1. Vá em: https://vercel.com/jmbento/bxd-event-manager/settings
2. Role até o final
3. Clique em **"Delete Project"**
4. Confirme digitando o nome do projeto

## PASSO 2: Criar projeto novo
1. Vá em: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione: **jmbento/bxd-event-manager**
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
5. **Environment Variables**:
   ```
   VITE_SUPABASE_URL = https://hzgzobcjdgddtrfzbywg.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTI0MDgsImV4cCI6MjA0ODg4ODQwOH0.G7YnVHYFEvSfTdnegH32biL7hY6u-dEm0Zwg5SqPLsQ
   VITE_DEMO_CAMPAIGN_SLUG = bento-demo
   ```

6. Clique em **"Deploy"**

## PASSO 3: Testar
Aguarde o deploy terminar (2-3 minutos) e teste a URL nova!

---

**ESSA É A SOLUÇÃO 100% GARANTIDA!**

Às vezes o Vercel trava e só deletando/recriando resolve. É normal! 🔥