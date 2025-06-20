# APLICAÇÃO SISTEMÁTICA DA METODOLOGIA PERFEITA

## TODOS OS HOOKS QUE PRECISAM DA CORREÇÃO:

1. ✅ **use-projects.ts** - JÁ CORRIGIDO
2. ✅ **use-tasks.ts** - JÁ CORRIGIDO  
3. 🔄 **use-team.ts** - EM ANDAMENTO
4. ⏳ **use-messages.ts** - PENDENTE
5. ⏳ **use-dashboard.ts** - PENDENTE
6. ⏳ **use-reports.ts** - PENDENTE
7. ⏳ **use-profile.ts** - PENDENTE

## TEMPLATE DE DEBUG OBRIGATÓRIO:

```typescript
console.log('🔍 [HOOK_NAME]: Iniciando busca...');
console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
console.log('🏢 EQUIPE:', equipe);
console.log('👤 USUARIO:', usuario);

// Teste de conectividade
const { data: testData, error: testError } = await supabase
  .from('usuarios')
  .select('count')
  .limit(1);

if (testError) {
  console.error('❌ [HOOK_NAME]: ERRO DE CONEXÃO:', testError);
  return;
}

console.log('✅ [HOOK_NAME]: Conexão OK, buscando dados...');

// Query principal aqui...

if (error) {
  console.error('❌ [HOOK_NAME]: ERRO SUPABASE:', error);
  console.error('❌ Código:', error.code);
  console.error('❌ Mensagem:', error.message);
  console.error('❌ Detalhes:', error.details);
} else {
  console.log('✅ [HOOK_NAME]: Dados encontrados:', data?.length || 0);
  console.log('📊 [HOOK_NAME]: Dados brutos:', data);
}
```

## ESTRATÉGIA DE APLICAÇÃO:

Aplicar o template em TODOS os hooks simultaneamente para garantir:
- Debug consistente em todo o sistema
- Diagnóstico uniforme de problemas
- Facilidade de manutenção futura
- Robustez geral da aplicação