#!/usr/bin/env node

// Script para executar queries diretas no Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cfvuldebsoxmhuarikdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVsZGVic294bWh1YXJpa2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjQ2MCwiZXhwIjoyMDY0ODMyNDYwfQ.tmkAszImh0G0TZaMBq1tXsCz0oDGtCHWcdxR4zdzFJM';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executarQuery(sql) {
  console.log('🔍 Executando query:', sql);
  console.log('=' .repeat(50));
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('✅ Resultado:');
    console.table(data);
    
  } catch (err) {
    console.error('❌ Erro JavaScript:', err);
  }
}

async function main() {
  console.log('🚀 DIAGNÓSTICO DIRETO EVENTOS_TIMELINE');
  console.log('=' .repeat(50));
  
  // 1. Verificar estrutura da tabela
  console.log('\n📋 1. ESTRUTURA DA TABELA:');
  await executarQuery(`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = 'eventos_timeline'
    ORDER BY ordinal_position;
  `);
  
  // 2. Ver todos os eventos
  console.log('\n📊 2. TODOS OS EVENTOS:');
  await executarQuery(`
    SELECT 
      id,
      tipo,
      titulo,
      autor,
      equipe_id,
      autor_id,
      created_at
    FROM eventos_timeline 
    ORDER BY created_at DESC;
  `);
  
  // 3. Contar por equipe
  console.log('\n🏢 3. EVENTOS POR EQUIPE:');
  await executarQuery(`
    SELECT 
      equipe_id,
      COUNT(*) as total_eventos,
      MIN(created_at) as primeiro_evento,
      MAX(created_at) as ultimo_evento
    FROM eventos_timeline 
    GROUP BY equipe_id
    ORDER BY total_eventos DESC;
  `);
  
  // 4. Verificar equipe específica da SixQuasar
  console.log('\n🎯 4. EVENTOS DA SIXQUASAR:');
  await executarQuery(`
    SELECT *
    FROM eventos_timeline 
    WHERE equipe_id = '650e8400-e29b-41d4-a716-446655440001'
    ORDER BY created_at DESC;
  `);
}

main().catch(console.error);