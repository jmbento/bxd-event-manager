#!/bin/bash

# ==============================================================================
# BXD Event Manager - Script de Setup de Segurança
# Executa verificações e gera chaves seguras
# ==============================================================================

echo "🔐 BXD Event Manager - Setup de Segurança"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se openssl está disponível
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL não encontrado. Instale antes de continuar.${NC}"
    exit 1
fi

echo "📋 Verificações de Segurança:"
echo ""

# 1. Verificar .env existe
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
else
    echo -e "${YELLOW}⚠️ Arquivo .env não encontrado${NC}"
    if [ -f ".env.example" ]; then
        echo "   Copiando de .env.example..."
        cp .env.example .env
        echo -e "${GREEN}   ✅ .env criado a partir de .env.example${NC}"
    fi
fi

# 2. Verificar .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env está no .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️ .env NÃO está no .gitignore - ADICIONANDO${NC}"
    echo -e "\n# Environment files\n.env\n.env.local\n.env.*.local" >> .gitignore
    echo -e "${GREEN}   ✅ Adicionado ao .gitignore${NC}"
fi

echo ""
echo "🔑 Gerando Chaves Seguras:"
echo ""

# 3. Gerar JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET (copie para .env):"
echo -e "${GREEN}$JWT_SECRET${NC}"
echo ""

# 4. Gerar ENCRYPTION_KEY
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY (copie para .env):"
echo -e "${GREEN}$ENCRYPTION_KEY${NC}"
echo ""

# 5. Verificar variáveis críticas no .env atual
echo "📊 Análise do .env atual:"
echo ""

if [ -f ".env" ]; then
    # JWT_SECRET
    if grep -q "JWT_SECRET=GERAR\|JWT_SECRET=sua-\|JWT_SECRET=$" .env; then
        echo -e "${RED}❌ JWT_SECRET não configurado corretamente${NC}"
    else
        echo -e "${GREEN}✅ JWT_SECRET parece configurado${NC}"
    fi
    
    # ENCRYPTION_KEY
    if grep -q "ENCRYPTION_KEY=" .env; then
        if grep -q "ENCRYPTION_KEY=GERAR\|ENCRYPTION_KEY=$" .env; then
            echo -e "${RED}❌ ENCRYPTION_KEY não configurado${NC}"
        else
            echo -e "${GREEN}✅ ENCRYPTION_KEY parece configurado${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ ENCRYPTION_KEY não encontrado no .env${NC}"
    fi
    
    # RESEND_API_KEY
    if grep -q "RESEND_API_KEY=re_" .env; then
        echo -e "${GREEN}✅ RESEND_API_KEY parece configurado${NC}"
    else
        echo -e "${YELLOW}⚠️ RESEND_API_KEY não configurado${NC}"
    fi
    
    # SUPABASE_URL
    if grep -q "SUPABASE_URL=https://" .env; then
        echo -e "${GREEN}✅ SUPABASE_URL configurado${NC}"
    else
        echo -e "${YELLOW}⚠️ SUPABASE_URL não configurado${NC}"
    fi
    
    # NODE_ENV
    if grep -q "NODE_ENV=production" .env; then
        echo -e "${GREEN}✅ NODE_ENV=production${NC}"
    else
        echo -e "${YELLOW}⚠️ NODE_ENV não está em 'production'${NC}"
    fi
fi

echo ""
echo "=========================================="
echo "📝 Próximos Passos:"
echo ""
echo "1. Copie as chaves geradas acima para seu .env"
echo "2. Configure as variáveis de ambiente no Railway/Vercel"
echo "3. Execute 'npm test' para verificar se tudo funciona"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANTE: Nunca commite o .env com valores reais!${NC}"
echo ""
