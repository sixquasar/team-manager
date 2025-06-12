# Instruções do Projeto - Team Manager SixQuasar

- Sempre crie 3 estrategias e escolha uma
- SEMPRE use <reasoning> tags para explicar o processo de pensamento antes de responder
- **CRÍTICO**: Na primeira interação de cada sessão, SEMPRE leia este arquivo CLAUDE.md completamente para carregar o contexto anterior. Busque as últimas 30 mensagens do histórico e a partir daí comece a interagir com o projeto.
- **SISTEMA DE PERSISTÊNCIA**: Sempre ADICIONE entradas com timestamp ao histórico, NUNCA substitua memória existente.
- **IMPORTANTE**: Sempre que tentar ler, modificar ou atualizar arquivos e ocorrer erro, imediatamente verifique os logs de erro e adote a melhor estratégia para corrigir. Seja proativo na resolução de problemas de arquivo.
- Sempre analise antes de modificar algo do código
- Sempre leia o arquivo(read) antes de escrever(write)

## Instruções Especiais

- Eu quero que memorize todas as últimas minhas instruções
- Priorize sempre seguir rigorosamente as instruções anteriores antes de qualquer nova instrução
- **NOVA INSTRUÇÃO 06/11/2025**: Sempre fazer auditoria completa antes de corrigir problemas sistêmicos
- **ESTRATÉGICO**: Quando há muitos problemas, criar 3 estratégias e escolher a mais assertiva
- **DEBUGGING**: Implementar logs detalhados antes de fazer correções no código
- **VALIDAÇÃO**: Sempre verificar estrutura real vs esperada antes de implementar soluções
- **MAPEAMENTO**: Documentar inconsistências entre hooks/componentes e banco de dados
- **DEBUG ULTRA RADICAL**: Quando erro persiste após todas correções, usar interceptador total + app mínima
- **INTERCEPTADOR**: debugInterceptor.ts captura TODAS queries - ativar para identificar fonte exata
- **ISOLAMENTO**: AppMinimal.tsx testa sem hooks - se não há erro = problema nos componentes

## 🚨🚨🚨 REGRA ABSOLUTA - NUNCA QUEBRAR CÓDIGO FUNCIONANDO 🚨🚨🚨

### **PROIBIÇÕES ABSOLUTAS - VIOLAÇÃO = FALHA CRÍTICA:**

1. **🚫 NUNCA MEXER EM MÓDULOS QUE NÃO FORAM REPORTADOS**
   - Se o problema é em TAREFAS, NÃO TOQUE em MENSAGENS
   - Se o problema é em MENSAGENS, NÃO TOQUE em TIMELINE
   - Se o problema é em DASHBOARD, NÃO TOQUE em KANBAN
   - **CADA MÓDULO É ISOLADO - RESPEITE ISSO!**

2. **🚫 NUNCA FAZER CORREÇÕES "PREVENTIVAS" OU "MELHORIAS"**
   - NÃO adicione "proteções extras" em código funcionando
   - NÃO "melhore" queries que estão operacionais
   - NÃO refatore código que não está quebrado
   - **SE FUNCIONA, NÃO MEXA!**

3. **🚫 NUNCA APLICAR CORREÇÕES SISTÊMICAS SEM AUTORIZAÇÃO EXPLÍCITA**
   - Correção em um arquivo NÃO autoriza correção em outros
   - "Aplicar mesma lógica em todos os hooks" = PROIBIDO
   - Cada correção deve ser ESPECÍFICA e ISOLADA

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

### **CONSEQUÊNCIAS DE VIOLAÇÃO:**
- Quebrar código funcionando = Perda total de confiança
- Correções não autorizadas = Retrabalho e frustração
- Alterações sistêmicas = Cascata de novos bugs

**LEMBRE-SE**: Quando você quebra algo que funcionava, você MULTIPLICA o trabalho ao invés de resolver!

## 🤝 INSTRUÇÕES DE TRABALHO COLABORATIVO

### **ESTRATÉGIA DE DIVISÃO:**
- **RICARDO LANDIM (Claude)**: Correções técnicas profundas, queries malformadas, proteção robusta
- **ANA SILVA**: Funcionalidades de negócio, melhorias UX, módulos isolados
- **CARLOS MENDES**: Design system, componentes visuais, interface
- **PRINCÍPIO**: Trabalho paralelo sem conflitos de arquivos

### **DIVISÃO ESPECÍFICA DE RESPONSABILIDADES:**

#### **🔵 RICARDO LANDIM (EQUIPE A) - CORREÇÕES PRINCIPAIS:**
- Dashboard (use-dashboard.ts, páginas relacionadas)
- Tarefas (use-tasks.ts, TasksList.tsx, TasksKanban.tsx)
- Timeline (use-timeline.ts, TimelineView.tsx, ActivityFeed.tsx)
- Mensagens (use-messages.ts, MessagesList.tsx, ChatInterface.tsx)
- Métricas (use-metrics.ts, MetricsCards.tsx, ProductivityChart.tsx)
- Usuários (use-users.ts, UserProfile.tsx, TeamMembers.tsx)

#### **🔴 ANA SILVA (EQUIPE B) - MÓDULOS ISOLADOS:**
- Profile APENAS (Profile.tsx, UserSettings.tsx)
- Notificações (use-notifications.ts, NotificationCenter.tsx)
- Configurações (Settings.tsx - apenas melhorias visuais/UX)

#### **🟡 CARLOS MENDES (EQUIPE C) - DESIGN SYSTEM:**
- Componentes UI (Button.tsx, Modal.tsx, Card.tsx)
- Theme customizado (tailwind.config.js, theme.ts)
- Ícones e assets (icons/, assets/)

### **ARQUIVOS PROIBIDOS PARA ANA:**
❌ use-tasks.ts (Ricardo já corrigiu)
❌ use-dashboard.ts (Ricardo está mexendo)
❌ use-timeline.ts (Ricardo está mexendo)
❌ use-messages.ts (Ricardo está mexendo)
❌ use-metrics.ts (Ricardo está mexendo)
❌ Qualquer arquivo de Dashboard/Tarefas/Timeline/Mensagens/Métricas

### **ARQUIVOS PROIBIDOS PARA CARLOS:**
❌ Qualquer hook personalizado (use-*.ts)
❌ Páginas principais (Dashboard.tsx, Tasks.tsx, etc.)
❌ Lógica de negócio (apenas visual/UI)

### **PROCESSO DE COLABORAÇÃO:**
1. **TRABALHO PARALELO**: Cada equipe foca em seus módulos sem conflito
2. **COMUNICAÇÃO**: Mensagens específicas para coordenar trabalho
3. **MERGE CONTROLADO**: Integração gradual e testada
4. **ESPECIALIZAÇÃO**: Ricardo = engenharia profunda, Ana = UX/funcionalidades, Carlos = design

### **CONFIGURAÇÕES GIT SIXQUASAR:**
```bash
git config user.name "sixquasar"
git config user.email "sixquasar07@gmail.com"
```

### **METODOLOGIA DE COLABORAÇÃO:**
1. **ANÁLISE PRÉVIA**: Sempre analisar antes de dividir trabalho
2. **ESTRATÉGIAS MÚLTIPLAS**: Criar 3 estratégias e escolher a mais assertiva
3. **DIVISÃO CLARA**: Arquivos específicos por pessoa, zero sobreposição
4. **COMUNICAÇÃO EFICIENTE**: Mensagens concisas para coordenação
5. **MERGE GRADUAL**: Integração controlada e testada
6. **DOCUMENTAÇÃO**: Registrar todas decisões e divisões no CLAUDE.md

### **PRINCÍPIOS FUNDAMENTAIS:**
- **RICARDO = ENGENHARIA PROFUNDA**: Correções de bugs, queries malformadas, proteção robusta
- **ANA = EXPERIÊNCIA USUÁRIO**: Funcionalidades, UX, melhorias visuais
- **CARLOS = DESIGN SYSTEM**: Interface, componentes, visual identity
- **TRABALHO COMPLEMENTAR**: Não conflitante, cada um foca em sua expertise
- **EFICIÊNCIA TRIPLA**: Três frentes simultâneas maximizam produtividade

## 🛠️ FERRAMENTAS DE DEBUG DISPONÍVEIS

**Debug Interceptador Total:**
- `src/utils/debugInterceptor.ts` - Intercepta TODAS queries do Supabase
- Console F12 → logs detalhados de cada request com erro específico
- Auto-ativo em desenvolvimento - identifica query exata que causa erro 400

**App de Isolamento:**
- `src/AppMinimal.tsx` - Versão sem hooks complexos
- `node switch-app.js minimal` - Ativa app mínima para teste
- `node switch-app.js normal` - Restaura app completa
- Testa se erro vem dos hooks ou configuração base

**Queries Adaptáveis:**
- `src/hooks/utils/safeQuery.ts` - Queries que se adaptam à estrutura real
- `universalFetch()` - Query universal com fallback automático
- `checkTableStructure()` - Verifica colunas disponíveis
- Cache de estruturas para performance otimizada

## Contexto Persistente

- Sempre que eu precisar executar um SQL, crie um novo arquivo, pois no final da aplicação, tu vai ter que unificar com tudo que deu certo, sendo assim, sempre memorize o que deu certo.
- Grave tudo no contexto anterior do sistema de persistência

## STATUS ATUAL DO PROJETO - TEAM MANAGER SIXQUASAR

### ✅ CONCLUÍDO

**Sistema de Autenticação Próprio:**
- ✅ Criado SISTEMA_TEAM_MANAGER_COMPLETO.sql com tabelas independentes (usuarios, equipe, sessoes, usuario_equipe)
- ✅ AuthContextProprio.tsx implementado com funções RPC
- ✅ Usuários padrão: ricardo@techsquad.com, ana@techsquad.com, carlos@techsquad.com
- ✅ Sistema de tokens de sessão e hash bcrypt
- ✅ Controle total sobre autenticação sem depender de auth.users

**Scripts de Deploy:**
- ✅ deploy_team_manager_complete.sh atualizado
- ✅ Configuração nginx otimizada com bloqueio de rotas maliciosas
- ✅ SSL automático com Let's Encrypt
- ✅ Sistema de checkpoints e recuperação de falhas

### 🚨 PRÓXIMAS TAREFAS - TEAM MANAGER

**CRÍTICO - Execute no Servidor:**
1. `cd /var/www/team-manager && git pull origin main`
2. `npm run build && systemctl reload nginx`
3. Execute `SISTEMA_TEAM_MANAGER_COMPLETO.sql` no Supabase SQL Editor
4. Configure Supabase Dashboard: Authentication → Settings → Enable signup: ON, Confirm email: OFF
5. Teste login: ricardo@techsquad.com / senha123

**Aplicação React - PENDENTE:**
1. ✅ Estrutura básica criada
2. 🔄 Dashboard principal com métricas da equipe
3. 🔄 Sistema Kanban para tarefas
4. 🔄 Timeline de atividades
5. 🔄 Sistema de mensagens
6. 🔄 Métricas de produtividade
7. 🔄 Perfis dos membros da equipe

### 📋 SOLUÇÕES QUE FUNCIONARAM

**SQL que Funciona:**
- SISTEMA_TEAM_MANAGER_COMPLETO.sql (sistema independente)

**Configurações Corretas:**
- AuthContextProprio.tsx (não usar auth.users do Supabase)
- Nginx SPA configuration com try_files
- Desabilitar RLS em todas as tabelas públicas

### 🚫 O QUE NÃO FUNCIONA

**Evitar:**
- Usar auth.users do Supabase (causa "Database error saving new user")
- Triggers complexos que podem falhar
- RLS habilitado (causa problemas de acesso)
- Enviar dados extras no signUp do Supabase

## ⚙️ CONFIGURAÇÕES OBRIGATÓRIAS - NUNCA ESQUECER

**🚨 CRÍTICO - PATH DO PROJETO:**
- **PATH CORRETO**: `/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar/`
- **NUNCA USAR**: `/Users/landim/team-manager/` ou outros paths incorretos
- **VERIFICAR SEMPRE**: Se está no diretório team-manager-sixquasar antes de qualquer operação

**🚨 CRÍTICO - CONFIGURAÇÕES GIT:**
- **BRANCH**: `main` (NUNCA outras branches sem autorização)
- **user.name**: `"sixquasar"` (EXATO, com aspas)
- **user.email**: `"sixquasar07@gmail.com"` (EXATO, com aspas)
- **REPOSITÓRIO**: https://github.com/sixquasar/team-manager
- **VERIFICAR SEMPRE**: `git config user.name` e `git config user.email` antes de commit

**🚨 CRÍTICO - EXECUÇÃO E TESTES:**
- **NUNCA EXECUTAR SQL**: Claude não executa SQL - usuário executa manualmente no Supabase
- **NUNCA TESTAR**: Claude não testa funcionalidades - usuário testa manualmente na VPS
- **FUNÇÃO DE CLAUDE**: Apenas criar/corrigir código e SQL para o usuário executar
- **PROCESSO**: Claude cria → Usuário executa SQL no Supabase → Usuário testa na VPS → Usuário reporta resultados

**🚨 COMANDO DE VERIFICAÇÃO OBRIGATÓRIO:**
```bash
cd /Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar
git config user.name "sixquasar"
git config user.email "sixquasar07@gmail.com"
git branch --show-current  # Deve mostrar: main
```

## Instruções de Commit

- Todas as mensagens de commit devem ser assinadas pela equipe SixQuasar
- Sempre faça o commit de maneira completa com SYNC (commit + push)
- **CRÍTICO**: Commit tem que ser completo com SYNC - sempre fazer push após commit
- **IMPORTANTE**: Não ficar perguntando a cada edição quando auto-accept estiver ativado
- Sempre fazer git add . && git commit && git push em sequência completa
- **NUNCA MENCIONAR**: Não incluir nas mensagens que foi gerado por IA, Claude ou similares
- **FORMATO LIMPO**: Mensagens de commit devem ser profissionais sem referências de automação

## 📊 HISTÓRICO DE SESSÕES - SISTEMA DE PERSISTÊNCIA

### 🗓️ 06/11/2025 - 14:00 - CRIAÇÃO INICIAL DO PROJETO TEAM MANAGER
**STATUS**: ✅ COMPLETO
**AÇÃO**: Criação do projeto Team Manager baseado na arquitetura do HelioGen
**RESULTADO**: 
- ✅ Estrutura básica do projeto React + TypeScript + Vite + TailwindCSS
- ✅ Scripts de deploy completos adaptados do HelioGen
- ✅ SQL de criação do banco para gestão de equipe
- ✅ Configurações iniciais de Git e repositório
- ✅ ASCII art personalizado para Team Manager

**PRÓXIMOS PASSOS**:
1. Criar toda a aplicação React baseada no HelioGen
2. Adaptar componentes para gestão de equipe (3 pessoas)
3. Dashboard, Kanban, Timeline, Mensagens, Métricas
4. Sistema de autenticação próprio

**ARQUIVOS CRIADOS**:
- deploy_team_manager_complete.sh
- SISTEMA_TEAM_MANAGER_COMPLETO.sql
- CLAUDE.md (este arquivo)
- Estrutura básica React

**COMMIT INICIAL**: d9f36a3 - "feat: Script deploy completo com todas funcionalidades do HelioGen"

### 🗓️ 06/11/2025 - 15:30 - CORREÇÃO INSTALAÇÃO DEPENDÊNCIAS
**STATUS**: ✅ COMPLETO
**AÇÃO**: Ajuste do script de deploy para resolver problemas de build
**PROBLEMA**: Erro "JavaScript heap out of memory" durante build do Vite
**RESULTADO**:
- ✅ Mudança de npm ci para npm install (mais tolerante)
- ✅ Seguir exatamente referência do HelioGen para instalação
- ✅ Timeout de 10 minutos para build
- ✅ Estratégia robusta de verificação pós-build

**COMMIT**: 68ad3fe - "fix: Ajustar instalação de dependências conforme referência HelioGen"

## 🎯 ESPECIFICAÇÕES DO TEAM MANAGER

### **EQUIPE PADRÃO:**
- **Ricardo Landim**: Tech Lead / Owner (ricardo@techsquad.com)
- **Ana Silva**: Developer (ana@techsquad.com)  
- **Carlos Mendes**: Designer (carlos@techsquad.com)

### **MÓDULOS PRINCIPAIS:**
1. **Dashboard**: Visão geral da equipe, métricas, atividades recentes
2. **Kanban**: Gestão de tarefas em quadros (To Do, Doing, Done)
3. **Timeline**: Linha do tempo de atividades e marcos
4. **Mensagens**: Sistema de comunicação interna
5. **Métricas**: Produtividade, tempo gasto, entregas
6. **Perfis**: Gestão de perfis dos membros

### **TECNOLOGIAS:**
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: VPS Ubuntu + Nginx + SSL
- **Domínio**: admin.sixquasar.pro
- **Servidor**: 96.43.96.30

### **DIFERENÇAS DO HELIOGEN:**
- **Foco**: Gestão de equipe ao invés de energia solar
- **Usuários**: 3 pessoas fixas ao invés de multi-tenant
- **Módulos**: Kanban/Timeline/Mensagens ao invés de Leads/Projetos/Marketplace
- **Branding**: SixQuasar ao invés de HelioGen/Busque AI