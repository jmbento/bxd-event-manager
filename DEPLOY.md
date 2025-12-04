# BXD Event Manager - Deploy Instructions

## Deploy no Vercel

### Pré-requisitos
1. Supabase configurado com os scripts SQL executados
2. Variáveis de ambiente configuradas

### Variáveis de Ambiente no Vercel
Configure essas variáveis no painel do Vercel:

```
VITE_SUPABASE_URL=https://hzgzobcjdgddtrfzbywg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTI0MDgsImV4cCI6MjA0ODg4ODQwOH0.G7YnVHYFEvSfTdnegH32biL7hY6u-dEm0Zwg5SqPLsQ
VITE_DEMO_CAMPAIGN_SLUG=bento-demo
```

### Comandos de Deploy

```bash
# Login no Vercel
npx vercel login

# Deploy para produção
npx vercel --prod
```

### URL da Aplicação Demo
Após o deploy, a aplicação ficará disponível em uma URL como:
`https://bxd-event-manager.vercel.app/?campaign=bento-demo`

### Scripts Úteis

```bash
# Build local
npm run build

# Deploy rápido
npm run quick

# Testar deploy
npm run test-deploy
```