# Instruções do Projeto Team Manager SixQuasar

- Sempre crie 3 estratégias e escolha uma
- SEMPRE use <reasoning> tags para explicar o processo de pensamento antes de responder
- **CRÍTICO**: Na primeira interação de cada sessão, SEMPRE leia este arquivo CLAUDE.md completamente para carregar o contexto anterior
- **SISTEMA DE PERSISTÊNCIA**: Sempre ADICIONE entradas com timestamp ao histórico, NUNCA substitua memória existente
- **IMPORTANTE**: Sempre que tentar ler, modificar ou atualizar arquivos e ocorrer erro, imediatamente verifique os logs de erro e adote a melhor estratégia para corrigir
- Sempre analise antes de modificar algo do código
- Sempre leia o arquivo(read) antes de escrever(write)

## 🚨🚨🚨 REGRA ABSOLUTA - NUNCA MISTURAR REPOSITÓRIOS 🚨🚨🚨

### **PROIBIÇÕES ABSOLUTAS - VIOLAÇÃO = FALHA CRÍTICA:**

1. **🚫 NUNCA MEXER NO HELIOGEN**
   - Este projeto é TEAM MANAGER, não HelioGen
   - PATH CORRETO: `/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar/`
   - PATH PROIBIDO: `/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/heliogen-local/`

2. **🚫 NUNCA CONFUNDIR CONTEXTOS**
   - Team Manager = Gestão de equipes (3 pessoas)
   - HelioGen = Energia solar (referência arquitetural apenas)
   - Usar HelioGen como REFERÊNCIA, não como destino

3. **🚫 NUNCA APLICAR CORREÇÕES NO PROJETO ERRADO**
   - Correções são APENAS para Team Manager
   - HelioGen deve permanecer INTOCADO
   - Se há dúvida, SEMPRE confirmar projeto

### **PROCESSO OBRIGATÓRIO ANTES DE QUALQUER ALTERAÇÃO:**

1. **CONFIRME**: "Estou trabalhando no Team Manager?"
2. **VERIFIQUE**: Path correto `/team-manager-sixquasar/`
3. **ISOLE**: Todas as mudanças são para Team Manager apenas
4. **PRESERVE**: HelioGen deve permanecer completamente INTOCADO

## ⚙️ CONFIGURAÇÕES OBRIGATÓRIAS - TEAM MANAGER

**🚨 CRÍTICO - PATH DO PROJETO:**
- **PATH CORRETO**: `/Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar/`
- **NUNCA USAR**: paths do HelioGen ou outros projetos
- **VERIFICAR SEMPRE**: Se está no diretório team-manager-sixquasar antes de qualquer operação

**🚨 CRÍTICO - CONFIGURAÇÕES GIT:**
- **BRANCH**: `team-manager-clean` 
- **user.name**: `"sixquasar-team"` (EXATO, com aspas)
- **user.email**: `"sixquasar07@gmail.com"` (EXATO, com aspas)
- **REPOSITÓRIO**: https://github.com/sixquasar/team-manager
- **VERIFICAR SEMPRE**: `git config user.name` e `git config user.email` antes de commit

**🚨 CRÍTICO - CONFIGURAÇÕES DE DEPLOY:**
- **DOMAIN**: admin.sixquasar.pro
- **VPS IP**: 96.43.96.30
- **SUPABASE**: cfvuldebsoxmhuarikdk.supabase.co
- **USUÁRIOS PADRÃO**: ricardo@techsquad.com, ana@techsquad.com, carlos@techsquad.com

**🚨 COMANDO DE VERIFICAÇÃO OBRIGATÓRIO:**
```bash
cd /Users/landim/.npm-global/lib/node_modules/@anthropic-ai/team-manager-sixquasar
git config user.name "sixquasar-team"
git config user.email "sixquasar07@gmail.com"
git branch --show-current  # Deve mostrar: team-manager-clean
```

## 📋 STATUS ATUAL DO PROJETO - TEAM MANAGER

### ✅ CONCLUÍDO

**Sistema de Autenticação Próprio:**
- ✅ AuthContextTeam.tsx implementado baseado no HelioGen
- ✅ SISTEMA_TEAM_MANAGER_COMPLETO.sql com schema completo
- ✅ Usuários padrão: ricardo@techsquad.com, ana@techsquad.com, carlos@techsquad.com
- ✅ Sistema de tokens de sessão com proteção robusta
- ✅ Controle total sobre autenticação sem depender de auth.users

**Dashboard Funcional:**
- ✅ Dashboard.tsx com interface completa
- ✅ use-dashboard.ts com queries adaptáveis e fallbacks
- ✅ Métricas de equipe, atividade recente, prazos
- ✅ Progresso de sprint e membros da equipe
- ✅ Proteção robusta com dados mock como fallback

**Sistema de Tarefas/Kanban:**
- ✅ Tasks.tsx com board Kanban funcional e view de lista
- ✅ use-tasks.ts com proteção robusta e dados mock
- ✅ Interface moderna com filtros por prioridade e busca
- ✅ Sistema de status com transições visuais
- ✅ Indicadores de prazo e responsáveis
- ✅ Configuração de prioridades e tipos de tarefas

**Arquitetura Base:**
- ✅ Estrutura de pastas organizada
- ✅ Componentes de UI (cards, buttons, inputs)
- ✅ Layout responsivo com Navbar e Sidebar
- ✅ Integração com Supabase
- ✅ TailwindCSS configurado
- ✅ TypeScript configurado

### 🔄 PENDENTE

**Páginas Restantes:**
- 📅 Timeline - Linha do tempo de eventos da equipe
- 💬 Messages - Sistema de comunicação interna
- 📊 Reports - Relatórios e métricas avançadas
- 👥 Team - Gestão de membros da equipe
- ⚙️ Settings - Configurações do sistema
- 👤 Profile - Perfil do usuário

**Scripts de Deploy:**
- 📦 deploy_team_manager_complete.sh (adaptado do HelioGen)
- 🔧 Configuração nginx para SPA
- 🔐 Configuração SSL
- 🚀 Pipeline de deploy automático

### 📊 DADOS MOCK IMPLEMENTADOS

**Usuários de Exemplo:**
```sql
-- ricardo@techsquad.com - Tech Lead - Admin
-- ana@techsquad.com - Frontend Developer - Member  
-- carlos@techsquad.com - Backend Developer - Member
```

**Tarefas de Exemplo:**
- ✅ "Sistema de Autenticação" (Concluída)
- 🔄 "Implementar Dashboard" (Em Progresso)
- ⏳ "Interface Kanban" (Pendente)
- 🚨 "Bug: Login não funciona no Safari" (Urgente)

**Estrutura de Dados:**
- 🏢 Equipes (teams) com cores e descrições
- ✅ Tarefas com status, prioridade, responsáveis
- 📁 Projetos com progresso e gerentes
- 💬 Mensagens com anexos e menções
- 📅 Eventos de timeline
- 📊 Métricas de produtividade

## 🛠️ ARQUITETURA TÉCNICA

**Stack Principal:**
- ⚛️ React 18 + TypeScript
- 🎨 TailwindCSS para styling
- 🔧 Vite como build tool
- 🗄️ Supabase como backend
- 🧭 React Router para navegação
- 🎯 Lucide React para ícones

**Padrões de Código:**
- 📁 Hooks personalizados para cada funcionalidade
- 🛡️ Proteção robusta com fallbacks para dados mock
- 🔄 Queries adaptáveis que se ajustam à estrutura do banco
- 🎯 Interfaces TypeScript bem definidas
- 📱 Design responsivo em todas as páginas

**Proteções Implementadas:**
- 🛡️ Try-catch em todas as queries
- 📦 Fallback automático para dados mock
- ⚡ Loading states em todas as operações
- 🚨 Error handling com mensagens user-friendly
- 🔄 Função refetch para recarregar dados

## 📋 PRÓXIMAS TAREFAS

### 🎯 FASE 1 - PÁGINAS CORE (ATUAL)
1. 📅 **Timeline**: Linha do tempo de eventos
2. 💬 **Messages**: Sistema de comunicação
3. 📊 **Reports**: Relatórios e métricas
4. 👥 **Team**: Gestão de membros

### 🎯 FASE 2 - DEPLOY E PRODUÇÃO
1. 📦 Script de deploy completo
2. 🔧 Configuração nginx otimizada
3. 🔐 SSL e certificados
4. 🚀 Pipeline de CI/CD

### 🎯 FASE 3 - MELHORIAS AVANÇADAS
1. 🔔 Sistema de notificações
2. 📎 Upload de arquivos
3. 🎨 Temas personalizáveis
4. 📱 PWA (Progressive Web App)

## Instruções de Commit

- Todas as mensagens de commit devem ser do Team Manager SixQuasar
- Sempre faça o commit de maneira completa com SYNC (commit + push)
- **CRÍTICO**: Commit tem que ser completo com SYNC - sempre fazer push após commit
- **NUNCA MENCIONAR**: Não incluir nas mensagens que foi gerado por IA, Claude ou similares
- **FORMATO LIMPO**: Mensagens de commit devem ser profissionais sem referências de automação

**Exemplo de commit correto:**
```bash
git commit -m "feat: Implementar Timeline com eventos da equipe

- Timeline.tsx com interface moderna
- use-timeline.ts com proteção robusta  
- Filtros por tipo de evento e período
- Integração completa com AuthContextTeam"
```

## 🎯 PRINCÍPIOS FUNDAMENTAIS

1. **TEAM MANAGER ALWAYS**: Nunca confundir com HelioGen
2. **PROTEÇÃO ROBUSTA**: Sempre implementar fallbacks
3. **DADOS MOCK**: Garantir funcionalidade mesmo sem banco
4. **ARQUITETURA HELIOGEN**: Usar como referência, não destino
5. **QUALIDADE CÓDIGO**: TypeScript + TailwindCSS + Proteções

## 📊 HISTÓRICO DE SESSÕES - TEAM MANAGER

### 🗓️ 06/11/2025 - 15:00 - INÍCIO DO PROJETO TEAM MANAGER
**STATUS**: ✅ COMPLETO
**AÇÃO**: Criação inicial do projeto Team Manager baseado na arquitetura HelioGen
**RESULTADO**: 
- AuthContextTeam.tsx implementado com proteção robusta
- SISTEMA_TEAM_MANAGER_COMPLETO.sql criado com schema completo
- Dashboard.tsx funcional com use-dashboard.ts
- Tasks.tsx com interface Kanban completa e use-tasks.ts
- Estrutura base organizada e configurada
- Sistema de autenticação próprio funcionando
- Proteção contra erros com fallbacks para dados mock

**CONQUISTAS**:
- ✅ Sistema de autenticação baseado no HelioGen mas adaptado para teams
- ✅ Dashboard com métricas de equipe e atividade recente
- ✅ Board Kanban funcional com filtros e busca
- ✅ Proteção robusta em todas as queries
- ✅ Dados mock para desenvolvimento offline
- ✅ Configurações git corretas para SixQuasar

**COMMITS**: 53bf338, 5f1158f
**ARQUIVOS CHAVE**: AuthContextTeam.tsx, Dashboard.tsx, Tasks.tsx, use-dashboard.ts, use-tasks.ts

**PRÓXIMA AÇÃO**: Continuar implementando páginas restantes (Timeline, Messages, Reports, Team)