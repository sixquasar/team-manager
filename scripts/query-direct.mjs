#!/usr/bin/env node

// Script para executar queries diretas no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfvuldebsoxmhuarikdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function queryDireta(query, titulo) {
  console.log(`\n🔍 ${titulo}`);
  console.log('='.repeat(60));
  console.log('Query:', query);
  console.log('-'.repeat(60));
  
  try {
    const { data, error } = await supabase
      .from('eventos_timeline')
      .select('*');
    
    if (error) {
      console.error('❌ Erro Supabase:', error);
      return;
    }
    
    console.log(`✅ Resultado: ${data.length} registros`);
    console.table(data);
    
  } catch (err) {
    console.error('❌ Erro JavaScript:', err);
  }
}

async function queryProjects() {
  console.log(`\n📊 DIAGNÓSTICO PROJECTS`);
  console.log('='.repeat(60));
  
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select('*');
    
    if (error) {
      console.error('❌ Erro Projetos:', error);
      return;
    }
    
    console.log(`✅ Projetos encontrados: ${data.length} registros`);
    console.table(data);
    
  } catch (err) {
    console.error('❌ Erro JavaScript:', err);
  }
}

async function main() {
  console.log('🚀 DIAGNÓSTICO DIRETO BANCO SUPABASE');
  console.log('='.repeat(60));
  
  // 1. Teste conexão básica
  console.log('\n🔌 1. TESTE DE CONEXÃO:');
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Conexão falhou:', error);
      return;
    } else {
      console.log('✅ Conexão OK com Supabase');
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
    return;
  }
  
  // 2. Verificar eventos timeline
  await queryDireta('SELECT * FROM eventos_timeline', 'EVENTOS TIMELINE');
  
  // 3. Verificar projetos
  await queryProjects();
  
  // 4. Verificar equipes
  console.log(`\n🏢 EQUIPES`);
  try {
    const { data, error } = await supabase
      .from('equipes')
      .select('*');
    
    if (error) {
      console.error('❌ Erro Equipes:', error);
    } else {
      console.log(`✅ Equipes: ${data.length} registros`);
      console.table(data);
    }
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

main().catch(console.error);