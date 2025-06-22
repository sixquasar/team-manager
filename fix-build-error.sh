#!/bin/bash

echo "🔧 CORRIGINDO ERRO DE BUILD - dataInI não definido"
echo "================================================"

echo "1️⃣ Limpando cache do build..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

echo "2️⃣ Limpando cache do Node..."
npm cache clean --force

echo "3️⃣ Reinstalando dependências..."
rm -rf node_modules/
npm install

echo "4️⃣ Rebuild completo..."
npm run build

echo "✅ Build corrigido! Arquivo pronto para deploy."
echo "📦 Arquivos em: dist/"