# Instruções do Projeto - Team Manager

## 🚨🚨🚨 CHECKLIST OBRIGATÓRIO - SEGUIR EM TODA RESPOSTA 🚨🚨🚨

### **📋 ANTES DE RESPONDER QUALQUER COISA:**
1. ✅ **LI o CLAUDE.md COMPLETAMENTE?** 
2. ✅ **USEI <reasoning> tags?**
3. ✅ **CRIEI 3 estratégias e escolhi uma?**
4. ✅ **ANALISEI antes de modificar código?**
5. ✅ **LI o arquivo antes de escrever?**
6. ✅ **ADICIONEI timestamp ao histórico?**
7. ✅ **NUNCA vou quebrar código funcionando?**
8. ✅ **SÓ mexo no módulo reportado pelo usuário?**
9. ✅ **NÃO executo/testo - apenas crio código?**
10. ✅ **VERIFIQUEI ALINHAMENTO SUPABASE vs CÓDIGO?**

### **🔥 REGRAS FUNDAMENTAIS - NUNCA VIOLAR:**
- Sempre crie 3 estrategias e escolha uma
- SEMPRE use <reasoning> tags para explicar o processo de pensamento antes de responder
- **CRÍTICO**: Na primeira interação de cada sessão, SEMPRE leia este arquivo CLAUDE.md completamente para carregar o contexto anterior
- **SISTEMA DE PERSISTÊNCIA**: Sempre ADICIONE entradas com timestamp ao histórico, NUNCA substitua memória existente
- **IMPORTANTE**: Sempre que tentar ler, modificar ou atualizar arquivos e ocorrer erro, imediatamente verifique os logs de erro e adote a melhor estratégia para corrigir
- Sempre analise antes de modificar algo do código
- Sempre leia o arquivo(read) antes de escrever(write)
- Nunca use mock data
- **CRÍTICO**: Sempre ao ter o compact, leia o CLAUDE.MD por completo
- Sempre ler o CLAUDE.MD antes de fazer qualquer coisa caso tenha esquecido de algo ou tenha probabilidade de ter esquecido algo
- **CRÍTICO**: SEMPRE verificar alinhamento entre Supabase Project e código da aplicação

[Restante do arquivo mantido igual ao conteúdo original]

## 📊 HISTÓRICO DE SESSÕES - SISTEMA DE PERSISTÊNCIA

### 🗓️ 21/06/2025 - 02:10 - CORREÇÃO DADOS REAIS DASHBOARD E REPORTS
**STATUS**: ✅ COMPLETO
**AÇÃO**: Correção de datas hardcoded e implementação de dados reais do banco
**PROBLEMA REPORTADO**: 
- Dashboard mostrando datas fixas (Jan 2025, Set 2025) ao invés de dados do banco
- Reports mostrando erro "Erro ao carregar relatórios"
- Usuário solicitou que tudo venha do banco como outras páginas

**SOLUÇÃO IMPLEMENTADA**:
- ✅ Criado hook use-dashboard-extended.ts para buscar projetos e marcos reais
- ✅ Dashboard agora busca projetos ativos do banco com datas reais
- ✅ Próximos Marcos busca tarefas de alta prioridade do banco
- ✅ Resumo Financeiro calcula valores baseados nos projetos reais
- ✅ Hook use-reports corrigido (teamMetrics → metrics)
- ✅ Removidas todas as datas e valores hardcoded

**ARQUIVOS CRIADOS/MODIFICADOS**:
- src/hooks/use-dashboard-extended.ts (novo)
- src/pages/Dashboard.tsx (atualizado para dados reais)
- src/hooks/use-reports.ts (corrigido nome do retorno)

**DADOS AGORA VINDOS DO BANCO**:
- Projetos: nome, cliente, progresso, orçamento, datas reais
- Marcos: tarefas prioritárias com datas de vencimento
- Financeiro: soma real dos orçamentos e faturamento
- Todas as datas formatadas em português (Jan, Fev, etc)

**COMMIT**: 0367a12
