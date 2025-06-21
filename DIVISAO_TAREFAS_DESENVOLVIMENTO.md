# 📋 DIVISÃO DE TAREFAS - TEAM MANAGER SIX QUASAR

## 👥 Equipe de Desenvolvimento
- **Rodrigo Marochi** - Foco: Módulos de Projetos e Timeline
- **Ricardo Landim** - Foco: Módulos de Mensagens e WebSocket
- **Leonardo Candiani** - Foco: Módulos de Equipe, Tarefas/Kanban e Perfil

## 🎯 REGRAS GERAIS
1. Cada desenvolvedor trabalhará em arquivos DISTINTOS para evitar conflitos
2. Toda mockdata deve ser removida e substituída por dados reais do Supabase
3. Seguir sempre as diretrizes do arquivo CLAUDE.md
4. Commits devem ser descritivos e incluir o nome do desenvolvedor

----

## 🚀 TAREFAS POR DESENVOLVEDOR

### 👨‍💻 RODRIGO MAROCHI - Projetos e Timeline

#### 📁 MÓDULO PROJETOS
**Arquivos de responsabilidade:**
- `src/pages/Projects.tsx`
- `src/hooks/use-projects.ts`
- `src/components/projects/NewProjectModal.tsx`
- `src/components/projects/ProjectDetailsModal.tsx`

**Tarefas:**

1. **Implementar exclusão de projetos** ⚡ ALTA
   - Adicionar botão de delete no ProjectDetailsModal
   - Criar função `deleteProject` no hook use-projects
   - Implementar confirmação antes de deletar
   - Atualizar lista após exclusão

2. **Sistema de múltiplos responsáveis** ⚡ ALTA
   - Modificar schema do banco: alterar `responsavel_id` para `responsaveis_ids` (array UUID[])
   - Atualizar NewProjectModal para permitir seleção múltipla
   - Criar componente MultiSelect para responsáveis
   - Atualizar visualização nos cards de projeto

3. **Campo de data da próxima entrega** 🔸 MÉDIA
   - Adicionar campo `data_proxima_entrega` na tabela projetos
   - Calcular automaticamente baseado nas tarefas do projeto
   - Exibir destaque visual quando próximo do prazo
   - Adicionar no modal de edição

4. **Campo de urgência do projeto** 🔸 MÉDIA
   - Adicionar campo `urgencia` (enum: baixa, normal, alta, critica)
   - Implementar indicadores visuais (cores e ícones)
   - Adicionar filtro por urgência
   - Ordenação automática por urgência

#### 📁 MÓDULO TIMELINE
**Arquivos de responsabilidade:**
- `src/pages/Timeline.tsx`
- `src/hooks/use-timeline.ts`
- `src/components/timeline/NewEventModal.tsx`

**Tarefas:**

1. **CRUD completo de eventos** ⚡ ALTA
   - Implementar edição de eventos (modal de edição)
   - Adicionar exclusão com confirmação
   - Melhorar validações de formulário
   - Adicionar mais tipos de eventos se necessário

---

### 👨‍💻 RICARDO LANDIM - Mensagens e WebSocket

#### 📁 MÓDULO MENSAGENS
**Arquivos de responsabilidade:**
- `src/pages/Messages.tsx`
- `src/hooks/use-messages.ts`
- `src/components/messages/NewChannelModal.tsx`
- `src/components/messages/MessageActionsModal.tsx`
- `server/websocket.js` (criar novo)

**Tarefas:**

1. **Implementar WebSocket para mensagens real-time** ⚡ ALTA
   - Criar servidor WebSocket em `server/websocket.js`
   - Implementar conexão no frontend
   - Sincronizar mensagens em tempo real
   - Implementar indicador de "digitando..."
   - Notificações de novas mensagens

2. **Sistema de canais no banco de dados** ⚡ ALTA
   - Criar tabela `canais` no Supabase:
     ```sql
     CREATE TABLE public.canais (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         nome VARCHAR(255) NOT NULL,
         descricao TEXT,
         tipo VARCHAR(50) DEFAULT 'publico' CHECK (tipo IN ('publico', 'privado')),
         equipe_id UUID REFERENCES public.equipes(id),
         criado_por UUID REFERENCES public.usuarios(id),
         membros UUID[] DEFAULT '{}',
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   - Remover canais hardcoded
   - Implementar CRUD de canais
   - Sistema de permissões por canal

3. **Lógica de conversação por equipes** 🔸 MÉDIA
   - Separar canais por equipe
   - Implementar canais privados
   - Sistema de convites para canais
   - Histórico de mensagens persistente

4. **Recursos adicionais de chat** 🔹 BAIXA
   - Upload de arquivos nas mensagens
   - Menções com @usuario
   - Formatação de código em mensagens
   - Threads de respostas

---

### 👨‍💻 LEONARDO CANDIANI - Equipe, Tarefas e Perfil

#### 📁 MÓDULO TAREFAS/KANBAN
**Arquivos de responsabilidade:**
- `src/pages/Tasks.tsx`
- `src/hooks/use-tasks.ts`
- `src/components/tasks/NewTaskModal.tsx`
- `src/components/tasks/TaskDetailsModal.tsx`

**Tarefas:**

1. **Conectar tarefas com projetos reais** ⚡ ALTA
   - Corrigir seleção de projeto no NewTaskModal
   - Buscar projetos ativos do banco
   - Validar se projeto existe antes de criar tarefa
   - Exibir nome do projeto nos cards

2. **Melhorar funcionalidade drag & drop** ⚡ ALTA
   - Adicionar animações suaves
   - Implementar preview durante o arraste
   - Salvar posição das tarefas no banco
   - Otimizar performance para muitas tarefas

3. **Reposicionar métricas de tarefas** 🔸 MÉDIA
   - Mover cards de estatísticas para o topo
   - Design responsivo para mobile
   - Adicionar mais métricas relevantes
   - Animações nos números

#### 📁 MÓDULO EQUIPE
**Arquivos de responsabilidade:**
- `src/pages/Team.tsx`
- `src/hooks/use-team.ts`
- `src/components/team/InviteMemberModal.tsx`
- `src/components/team/EditMemberModal.tsx`

**Tarefas:**

1. **CRUD 100% funcional** ⚡ ALTA
   - Validar todos os fluxos de CRUD
   - Melhorar tratamento de erros
   - Implementar soft delete
   - Logs de auditoria

2. **Integração com outros módulos** 🔸 MÉDIA
   - Criar função global `getUsersByTeam`
   - Expor API para outros componentes
   - Cache de dados de equipe
   - Sincronização em tempo real

#### 📁 MÓDULO PERFIL
**Arquivos de responsabilidade:**
- `src/pages/Profile.tsx`
- `src/hooks/use-profile.ts`
- `src/contexts/AuthContextTeam.tsx`

**Tarefas:**

1. **Sincronização de dados do usuário** ⚡ ALTA
   - Atualizar nome/cargo em todos os lugares quando editado
   - Criar sistema de eventos para propagação
   - Cache inteligente de dados do usuário
   - Atualização em tempo real

2. **Melhorias no perfil** 🔸 MÉDIA
   - Upload de avatar
   - Mais campos editáveis
   - Histórico de atividades
   - Configurações de notificações

---

## 📊 TAREFAS COMPARTILHADAS (Discussão em equipe)

### 🗄️ BANCO DE DADOS
1. **Verificar e alinhar todas as tabelas**
   - Revisar SISTEMA_TEAM_MANAGER_COMPLETO.sql
   - Aplicar migrations pendentes
   - Documentar schema atualizado

2. **Otimizações de performance**
   - Criar índices necessários
   - Implementar paginação onde faltante
   - Cache de queries frequentes

### 🔐 SEGURANÇA
1. **Implementar RLS (Row Level Security)**
   - Políticas por equipe
   - Isolamento de dados
   - Auditoria de acessos

---

## 🚦 PRIORIDADES

### ⚡ ALTA PRIORIDADE (Fazer primeiro)
1. WebSocket para mensagens (Ricardo)
2. Exclusão de projetos (Rodrigo)
3. Conectar tarefas com projetos reais (Leonardo)
4. Sistema de múltiplos responsáveis (Rodrigo)

### 🔸 MÉDIA PRIORIDADE (Fazer em seguida)
1. Campos adicionais em projetos (Rodrigo)
2. Sistema de canais (Ricardo)
3. Reposicionar métricas (Leonardo)

### 🔹 BAIXA PRIORIDADE (Fazer por último)
1. Recursos extras de chat (Ricardo)
2. Melhorias visuais gerais

---

## 📝 INSTRUÇÕES IMPORTANTES

1. **Antes de começar:**
   - Fazer pull da branch main
   - Ler arquivo CLAUDE.md
   - Verificar estrutura do banco

2. **Durante o desenvolvimento:**
   - Commits frequentes e descritivos
   - Testar localmente antes de push
   - Documentar mudanças importantes

3. **Ao finalizar tarefas:**
   - Marcar como concluída neste documento
   - Comunicar no canal da equipe
   - Atualizar documentação se necessário

4. **Comunicação:**
   - Daily standup às 9h
   - Updates no Slack/Discord
   - Code review antes de merge

---

## ✅ CHECKLIST DE CONCLUSÃO

### Rodrigo Marochi
- [ ] Exclusão de projetos
- [ ] Múltiplos responsáveis
- [ ] Data próxima entrega
- [ ] Campo urgência
- [ ] CRUD Timeline completo

### Ricardo Landim
- [ ] WebSocket implementado
- [ ] Tabela canais criada
- [ ] Canais por equipe
- [ ] Upload de arquivos
- [ ] Menções funcionando

### Leonardo Candiani
- [ ] Tarefas conectadas com projetos
- [ ] Drag & drop melhorado
- [ ] Métricas reposicionadas
- [ ] CRUD equipe 100%
- [ ] Sincronização perfil

---

**PRÓXIMA REUNIÃO:** 23/06/2025 - 10:00