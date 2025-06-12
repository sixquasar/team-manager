# 📋 INSTRUÇÕES ADICIONADAS - PROTOCOLO DE COMMIT E RELATÓRIOS

## 📋 PROTOCOLO OBRIGATÓRIO DE RELATÓRIO PRÉ-COMMIT

### **INSTRUÇÃO PERFEITA E ROBUSTA:**

**ANTES DE QUALQUER COMMIT, SEMPRE FORNEÇA:**

1. **RELATÓRIO EXECUTIVO (máximo 500 caracteres)**:
   - Problema identificado
   - Causa raiz
   - Solução implementada
   - Resultado esperado

2. **CAMINHOS COMPLETOS ALTERADOS**:
   - Lista TODOS os arquivos modificados com path absoluto completo
   - Indicar linhas específicas alteradas quando relevante

3. **AGUARDAR AUTORIZAÇÃO EXPLÍCITA** do usuário antes do commit

**EXEMPLO DE FORMATO OBRIGATÓRIO:**
```
📋 RELATÓRIO: Problema X na funcionalidade Y. Causa: código Z. Solução: implementação W. Resultado: correção completa.

🔧 ARQUIVOS ALTERADOS:
- /path/completo/arquivo1.tsx (linhas 100-105)
- /path/completo/arquivo2.ts (linha 50)

AGUARDANDO AUTORIZAÇÃO PARA COMMIT.
```

**CONSEQUÊNCIA DE VIOLAÇÃO**: Commit rejeitado + revisão obrigatória

## 🚨 REGRA CRÍTICA - ARQUIVO CLAUDE.MD

**NUNCA FAZER COMMIT DO ARQUIVO CLAUDE.MD!**
- Este arquivo é EXCLUSIVAMENTE para o Claude Code ter contexto
- É um arquivo LOCAL de instruções e histórico  
- NÃO deve ser versionado no repositório
- Se você fizer commit do CLAUDE.md = exposição de contexto interno
- **SEMPRE EXCLUA CLAUDE.md dos commits!**
- **MAS MANTENHA ELE ATUALIZADO LOCALMENTE** para contexto

## 📐 PRINCÍPIO DE CORREÇÃO CIRÚRGICA

### **PROCESSO OBRIGATÓRIO ANTES DE QUALQUER ALTERAÇÃO:**

1. **PERGUNTE**: "Qual arquivo ESPECÍFICO está com problema?"
2. **CONFIRME**: "O erro está APENAS em [arquivo X]?"
3. **ISOLE**: Trabalhe SOMENTE no arquivo confirmado
4. **PRESERVE**: Todo código em outros arquivos deve permanecer INTOCADO

### **MANTRA DE SEGURANÇA:**
```
"O USUÁRIO REPORTOU ERRO EM [X]? 
 ENTÃO EU SÓ POSSO MEXER EM [X].
 TODO O RESTO ESTÁ PROIBIDO."
```

## 📊 SISTEMA DE PERSISTÊNCIA

**SEMPRE ADICIONE entradas com timestamp ao histórico, NUNCA substitua memória existente.**

Formato obrigatório para novos registros:
```
### 🗓️ DD/MM/AAAA - HH:MM - TÍTULO DA AÇÃO
**STATUS**: ✅ COMPLETO / 🔄 EM ANDAMENTO / ❌ FALHOU
**AÇÃO**: Descrição da ação realizada
**RESULTADO**: 
- Lista dos resultados obtidos
- Detalhes específicos
- Commits realizados

**PRÓXIMA AÇÃO**: O que fazer em seguida
```

## 🎯 ESTRATÉGIAS OBRIGATÓRIAS

**Sempre crie 3 estratégias e escolha uma** antes de qualquer ação complexa:

**ESTRATÉGIA 1**: [Descrição da primeira abordagem]
**ESTRATÉGIA 2**: [Descrição da segunda abordagem]  
**ESTRATÉGIA 3**: [Descrição da terceira abordagem]

**ESCOLHO ESTRATÉGIA X** - [Justificativa da escolha]

## 🔍 DEBUGGING SISTEMÁTICO

**SEMPRE use <reasoning> tags** para explicar o processo de pensamento antes de responder.

**Quando há problemas persistentes:**
1. **VALIDAÇÃO**: Sempre verificar estrutura real vs esperada
2. **MAPEAMENTO**: Documentar inconsistências entre código e dados
3. **DEBUG DETALHADO**: Implementar logs antes de fazer correções
4. **ISOLAMENTO**: Testar componentes individualmente

---

**NOTA**: Estas instruções devem ser integradas ao arquivo CLAUDE.md local do projeto, na seção apropriada, mantendo a estrutura e numeração existente.