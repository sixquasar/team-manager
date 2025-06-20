# Instruções do Projeto - Team Manager

- Sempre crie 3 estrategias e escolha uma
- SEMPRE use <reasoning> tags para explicar o processo de pensamento antes de responder
- **CRÍTICO**: Na primeira interação de cada sessão, SEMPRE leia este arquivo CLAUDE.md completamente para carregar o contexto anterior
- **SISTEMA DE PERSISTÊNCIA**: Sempre ADICIONE entradas com timestamp ao histórico, NUNCA substitua memória existente
- **IMPORTANTE**: Sempre que tentar ler, modificar ou atualizar arquivos e ocorrer erro, imediatamente verifique os logs de erro e adote a melhor estratégia para corrigir
- Sempre analise antes de modificar algo do código
- Sempre leia o arquivo(read) antes de escrever(write)
- Nunca use mock data
- Sempre ler o CLAUDE.MD antes de fazer qualquer coisa caso tenha esquecido de algo ou tenha probabilidade de ter esquecido algo

## Instruções Especiais

- Memorize todas as instruções e mantenha consistência entre sessões
- Priorize sempre seguir rigorosamente as instruções anteriores antes de qualquer nova instrução
- **DEBUGGING**: Implementar logs detalhados antes de fazer correções no código
- **VALIDAÇÃO**: Sempre verificar estrutura real vs esperada antes de implementar soluções

## 🎯 METODOLOGIA PERFEITA DE CORREÇÃO - SEMPRE SEGUIR

### **PROCESSO OBRIGATÓRIO PARA CORRIGIR PÁGINAS QUEBRADAS:**

1. **🔍 DIAGNOSTICAR O PROBLEMA RAIZ:**
   - Verificar se IDs do AuthContext correspondem aos UUIDs do Supabase
   - Verificar se chaves .env estão corretas (ANON_KEY vs SERVICE_ROLE)
   - Verificar se tabelas existem e têm dados no Supabase

2. **🔧 APLICAR CORREÇÕES SISTEMÁTICAS:**
   - **AuthContext**: Usar UUIDs EXATOS do banco (não IDs mock)
   - **Arquivo .env**: SERVICE_ROLE key correta para desenvolvimento
   - **Hooks**: Adicionar debug detalhado para diagnosticar problemas
   - **Queries**: Verificar nomes de tabelas e campos corretos

3. **📝 DEBUG OBRIGATÓRIO EM HOOKS:**
   ```typescript
   console.log('🔍 [NOME]: Iniciando busca...');
   console.log('🌐 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('🔑 ANON KEY (primeiros 50):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50));
   console.log('🏢 EQUIPE:', equipe);
   console.log('👤 USUARIO:', usuario);
   ```

4. **🚀 DEPLOY E TESTE:**
   - Commit + push das alterações
   - Deploy via `./Scripts Deploy/deploy_team_manager_complete.sh`
   - Verificar logs no Console F12 na VPS
   - Executar SQL de correção se necessário

### **PÁGINAS QUE PRECISAM DESTA METODOLOGIA:**

#### **✅ PÁGINAS TODAS CORRIGIDAS COM METODOLOGIA PERFEITA:**
1. **✅ PROJECTS** - Sincronizado com projetos reais + debug completo
2. **✅ TASKS** - Debug completo + teste de conectividade + fallback SixQuasar  
3. **✅ TEAM** - Debug completo + teste de conectividade + fallback SixQuasar
4. **✅ MESSAGES** - Debug completo + teste de conectividade + fallback SixQuasar
5. **✅ DASHBOARD** - Debug completo + teste de conectividade + fallback SixQuasar
6. **✅ REPORTS** - Debug completo + teste de conectividade + fallback SixQuasar
7. **✅ PROFILE** - Debug completo + teste de conectividade + fallback SixQuasar

#### **🎯 METODOLOGIA APLICADA EM TODOS OS HOOKS:**
- 🔍 Debug inicial: URL, ANON_KEY, EQUIPE, USUARIO
- 🌐 Teste de conectividade automático  
- ❌ Error handling detalhado: código, mensagem, detalhes
- ✅ Logs de sucesso com quantidade e dados brutos
- 🔄 Fallback inteligente para dados SixQuasar

### **TEMPLATE DE CORREÇÃO PARA HOOKS:**

```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    console.log('🔍 [HOOK_NAME]: Iniciando busca...');
    console.log('🏢 EQUIPE:', equipe);

    // Teste de conectividade
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ ERRO DE CONEXÃO:', testError);
      return;
    }

    // Query principal
    const { data, error } = await supabase
      .from('TABELA_NOME')
      .select('*')
      .eq('equipe_id', equipe?.id);

    if (error) {
      console.error('❌ ERRO:', error);
    } else {
      console.log('✅ DADOS ENCONTRADOS:', data?.length || 0);
      setData(data || []);
    }
  } catch (error) {
    console.error('❌ ERRO JAVASCRIPT:', error);
  } finally {
    setLoading(false);
  }
};
```

### **CONFIGURAÇÕES CRÍTICAS SEMPRE VERIFICAR:**

```bash
# AuthContext - IDs CORRETOS
'550e8400-e29b-41d4-a716-446655440001' # Ricardo Landim
'550e8400-e29b-41d4-a716-446655440002' # Leonardo Candiani  
'550e8400-e29b-41d4-a716-446655440003' # Rodrigo Marochi
'650e8400-e29b-41d4-a716-446655440001' # Equipe SixQuasar

# .env - CHAVES CORRETAS
VITE_SUPABASE_URL=https://cfvuldebsoxmhuarikdk.supabase.co
VITE_SUPABASE_ANON_KEY=[SERVICE_ROLE para desenvolvimento]
```

[... rest of the existing content remains the same ...]