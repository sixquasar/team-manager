#!/bin/bash

#################################################################
#                                                               #
#        FIX RECHARTS DEPENDENCY - CORREÇÃO RÁPIDA             #
#        Instala biblioteca recharts necessária para Dashboard AI #
#        Versão: 1.0.0                                          #
#        Data: 25/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}📦 INSTALANDO DEPENDÊNCIA RECHARTS${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${VERMELHO}❌ Execute este script no diretório raiz do projeto!${RESET}"
    exit 1
fi

# Instalar recharts
echo -e "${AMARELO}➤ Instalando recharts...${RESET}"
npm install recharts --save

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Recharts instalado com sucesso!${RESET}"
else
    echo -e "${VERMELHO}❌ Erro ao instalar recharts${RESET}"
    exit 1
fi

# Verificar instalação
echo ""
echo -e "${AMARELO}➤ Verificando instalação...${RESET}"
if grep -q "recharts" package.json; then
    RECHARTS_VERSION=$(grep -A1 "recharts" package.json | grep -o '"[0-9.^]*"' | tr -d '"')
    echo -e "${VERDE}✅ Recharts versão ${RECHARTS_VERSION} adicionado ao package.json${RESET}"
else
    echo -e "${VERMELHO}❌ Recharts não foi adicionado ao package.json${RESET}"
    exit 1
fi

# Fazer build novamente
echo ""
echo -e "${AMARELO}➤ Executando build novamente...${RESET}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${VERDE}✅ Build concluído com sucesso!${RESET}"
else
    echo -e "${VERMELHO}❌ Build ainda falhou. Verifique outros erros.${RESET}"
    exit 1
fi

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ DEPENDÊNCIA CORRIGIDA E BUILD REALIZADO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"