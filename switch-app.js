#!/usr/bin/env node

// Script para alternar entre App normal e AppMinimal
// Baseado no HelioGen para debug de problemas

const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
const appMinimalPath = path.join(__dirname, 'src', 'AppMinimal.tsx');
const appBackupPath = path.join(__dirname, 'src', 'App.normal.tsx');

const mode = process.argv[2];

if (!mode || !['minimal', 'normal'].includes(mode)) {
  console.log('❌ Uso: node switch-app.js [minimal|normal]');
  console.log('');
  console.log('Exemplos:');
  console.log('  node switch-app.js minimal  # Ativa app mínima para debug');
  console.log('  node switch-app.js normal   # Restaura app completa');
  process.exit(1);
}

try {
  if (mode === 'minimal') {
    // Verificar se AppMinimal existe
    if (!fs.existsSync(appMinimalPath)) {
      console.log('❌ AppMinimal.tsx não encontrado. Criando...');
      
      const appMinimalContent = `import React from 'react';

// App Mínima para teste de isolamento
// Testa se o erro vem dos hooks ou do Supabase client base

export default function AppMinimal() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Team Manager - App Mínima
        </h1>
        <p className="text-gray-600 mb-4">
          Modo de teste: sem hooks complexos, apenas UI básica
        </p>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Status do Teste</h2>
          <p className="text-sm text-gray-600">
            Se esta tela carregar sem erros 400, o problema está nos hooks.
            <br />
            Se houver erros 400, o problema está no cliente Supabase.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recarregar
        </button>
      </div>
    </div>
  );
}`;
      
      fs.writeFileSync(appMinimalPath, appMinimalContent);
      console.log('✅ AppMinimal.tsx criado');
    }

    // Backup do App normal
    if (fs.existsSync(appPath)) {
      fs.copyFileSync(appPath, appBackupPath);
      console.log('✅ Backup do App.tsx criado em App.normal.tsx');
    }

    // Substituir App.tsx pelo AppMinimal
    fs.copyFileSync(appMinimalPath, appPath);
    console.log('🔄 App mínima ATIVADA');
    console.log('');
    console.log('📋 Como testar:');
    console.log('1. npm run dev');
    console.log('2. Abrir Console F12');
    console.log('3. Verificar se há erros 400');
    console.log('4. Se SEM erros = problema nos hooks');
    console.log('5. Se COM erros = problema no cliente Supabase');

  } else if (mode === 'normal') {
    // Restaurar App normal
    if (fs.existsSync(appBackupPath)) {
      fs.copyFileSync(appBackupPath, appPath);
      fs.unlinkSync(appBackupPath);
      console.log('✅ App completa RESTAURADA');
    } else {
      console.log('❌ Backup não encontrado. App já está normal?');
    }
  }

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}