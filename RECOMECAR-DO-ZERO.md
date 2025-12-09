# 🔄 GUIA: RECOMEÇAR PROJETO DO ZERO

## 📦 O QUE SALVAR ANTES DE DELETAR

### 1. Arquivos CRÍTICOS (não perder):
```
App-backup.tsx           → App completo funcionando
setup_supabase_schema.sql → Schema do banco
setup_supabase_data.sql   → Dados demo
components/              → Todos os componentes
services/                → Serviços (Supabase, Gemini, etc)
types.ts                 → Definições de tipos
config/moduleConfig.ts   → Configuração de módulos
```

### 2. Credenciais Supabase:
```
URL: https://hzgzobcjdgddtrfzbywg.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjcyMTQsImV4cCI6MjA0ODkwMzIxNH0.2s3pF8bE6KqUTMnrC_L1nDNQSRZLHH3v6X6gvdXLaHI
SLUG: bento-demo
```

---

## 🆕 CRIAR PROJETO DO ZERO (10 minutos)

### Passo 1: Criar projeto React+Vite limpo
```bash
# Em uma pasta nova
npm create vite@latest bxd-event-manager-novo -- --template react-ts

cd bxd-event-manager-novo
npm install
```

### Passo 2: Instalar dependências necessárias
```bash
npm install @supabase/supabase-js
npm install react-hot-toast
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Passo 3: Configurar Tailwind
Editar `tailwind.config.js`:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Passo 4: Copiar arquivos importantes
```bash
# Do projeto antigo para o novo
cp -r /caminho/antigo/components ./src/
cp -r /caminho/antigo/services ./src/
cp /caminho/antigo/types.ts ./src/
cp /caminho/antigo/App-backup.tsx ./src/App.tsx
cp -r /caminho/antigo/config ./src/
```

### Passo 5: Criar .env.local
```env
VITE_SUPABASE_URL=https://hzgzobcjdgddtrfzbywg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjcyMTQsImV4cCI6MjA0ODkwMzIxNH0.2s3pF8bE6KqUTMnrC_L1nDNQSRZLHH3v6X6gvdXLaHI
VITE_DEMO_CAMPAIGN_SLUG=bento-demo
```

### Passo 6: Testar
```bash
npm run dev
# Abrir http://localhost:5173
```

### Passo 7: Git + GitHub
```bash
git init
git add .
git commit -m "feat: fresh start - clean project"
git branch -M main
git remote add origin https://github.com/jmbento/bxd-event-manager-novo.git
git push -u origin main
```

### Passo 8: Deploy Vercel (PELA WEB)
1. https://vercel.com/dashboard
2. Add New → Project
3. Import do GitHub: bxd-event-manager-novo
4. Framework: Vite
5. Adicionar 3 variáveis de ambiente
6. Deploy

---

## ✅ VANTAGENS DE RECOMEÇAR

- ✅ Sem cache corrompido
- ✅ Sem arquivos de teste misturados
- ✅ Estrutura limpa e organizada
- ✅ Build garantido funcionando
- ✅ Deploy sem problemas de histórico

---

## 🎯 ALTERNATIVA RÁPIDA (5 minutos)

Se preferir NÃO deletar tudo, apenas limpar:

```bash
cd "/Volumes/bxdMAC/Projetos apps/bxd-event-manager"

# Deletar lixo
rm -rf node_modules dist .vercel
rm App-BROKEN.tsx App-SIMPLE.tsx App-MEGA-SIMPLE.tsx App-FAILED.tsx
rm index-*.tsx

# Reinstalar limpo
npm install

# Build limpo
npm run build

# Testar
npm run dev
```

---

## 💡 MINHA RECOMENDAÇÃO

**OPÇÃO A:** Recomeçar do zero (mais limpo, menos stress)
**OPÇÃO B:** Limpar o atual e tentar mais uma vez

**Qual você prefere?**

Se escolher OPÇÃO A, posso criar os comandos exatos para copiar só o que importa.
