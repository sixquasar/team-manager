# 🤖 Guia de Uso - IA no Team Manager com LangChain + LangGraph

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Onde Encontrar a IA no Sistema](#onde-encontrar-a-ia-no-sistema)
3. [Funcionalidades Disponíveis](#funcionalidades-disponíveis)
4. [Como Usar](#como-usar)
5. [Boas Práticas](#boas-práticas)
6. [Casos de Uso Reais](#casos-de-uso-reais)
7. [Arquitetura Técnica](#arquitetura-técnica)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Team Manager agora possui um **Microserviço de IA** powered by **LangChain + LangGraph** integrado com **OpenAI GPT-4**. Este sistema analisa seus projetos em tempo real e fornece insights acionáveis para melhorar a gestão.

### O que é LangChain?
- **Framework** para construir aplicações com LLMs (Large Language Models)
- Facilita a integração com OpenAI, Google, Anthropic, etc
- Gerencia prompts, memória e chains de raciocínio

### O que é LangGraph?
- **Extensão** do LangChain para criar workflows complexos
- Permite criar "grafos" de decisão e processamento
- Ideal para análises multi-etapas e automações

---

## 📍 Onde Encontrar a IA no Sistema

### 1. **Análise de Projetos** (Já Implementado ✅)
**Localização**: `Projetos > Clique em qualquer projeto > Modal de Detalhes`

Quando você abre os detalhes de um projeto, automaticamente aparece um card "**Análise Inteligente**" com:
- 🏥 **Health Score** (0-100%) - Saúde geral do projeto
- ⚠️ **Riscos Identificados** - Problemas potenciais detectados pela IA
- 💡 **Recomendações** - Sugestões de melhorias
- ✅ **Próximos Passos** - Ações recomendadas

### 2. **Dashboard com Insights** (Em Desenvolvimento 🚧)
**Localização**: `Dashboard > Card de IA Insights`
- Análise agregada de todos os projetos
- Tendências e padrões identificados
- Alertas proativos

### 3. **Assistente de Documentos** (Planejado 📅)
**Localização**: `Dashboard > Upload de Documentos`
- Upload de contratos, propostas, briefings
- Extração automática de tarefas e prazos
- Criação de projetos baseada em documentos

---

## 🚀 Funcionalidades Disponíveis

### 1. **Análise Inteligente de Projetos**
```typescript
// O que a IA analisa:
- Nome e descrição do projeto
- Status atual (planejamento, em progresso, etc)
- Progresso (%)
- Orçamento usado vs total
- Prazo de entrega
- Tecnologias utilizadas
```

### 2. **Métricas Geradas pela IA**
- **Health Score**: Calcula saúde do projeto baseado em múltiplos fatores
- **Risk Assessment**: Identifica riscos como atraso, estouro de orçamento
- **Recommendations**: Sugere ações específicas para melhorar
- **Next Steps**: Lista priorizada de próximas ações

### 3. **Integração em Tempo Real**
- Análise automática ao abrir projeto
- Botão de refresh para nova análise
- WebSocket para atualizações ao vivo (em breve)

---

## 💻 Como Usar

### Passo 1: Acessar um Projeto
1. Faça login em https://admin.sixquasar.pro
2. Navegue para "Projetos" no menu lateral
3. Clique em qualquer projeto da lista

### Passo 2: Visualizar Análise IA
No modal que abrir, role para baixo até ver o card "**Análise Inteligente**"

![Exemplo de Análise]
```
┌─────────────────────────────────────┐
│ ✨ Análise Inteligente              │
│ Powered by GPT-4                    │
├─────────────────────────────────────┤
│ Saúde do Projeto         85%        │
│ ████████████████░░░  Excelente      │
├─────────────────────────────────────┤
│ ⚠️ Riscos Identificados             │
│ • Prazo apertado                    │
│ • Dependências externas             │
├─────────────────────────────────────┤
│ 💡 Recomendações                    │
│ → Aumentar equipe em 20%            │
│ → Revisar cronograma                │
├─────────────────────────────────────┤
│ ✅ Próximos Passos                  │
│ ✓ Reunião de alinhamento            │
│ ✓ Definir milestones                │
└─────────────────────────────────────┘
```

### Passo 3: Atualizar Análise
Clique no botão 🔄 no canto superior direito do card para solicitar nova análise

---

## 📚 Boas Práticas

### 1. **Mantenha Dados Atualizados**
- A IA é tão boa quanto os dados fornecidos
- Atualize progresso regularmente
- Mantenha descrições claras e detalhadas

### 2. **Use as Recomendações como Guia**
- As sugestões da IA são baseadas em padrões
- Sempre aplique seu contexto e experiência
- Use como segunda opinião, não verdade absoluta

### 3. **Monitore o Health Score**
- **80-100%**: Projeto saudável ✅
- **60-79%**: Atenção necessária ⚠️
- **0-59%**: Ação urgente required 🚨

### 4. **Integre no Workflow**
- Revise análises em reuniões de status
- Use riscos identificados para planning
- Compartilhe insights com a equipe

---

## 🎯 Casos de Uso Reais

### Caso 1: Projeto em Risco de Atraso
```
Situação: Projeto com 70% do prazo consumido mas apenas 40% concluído

IA Detecta:
- Health Score: 45% (Crítico)
- Risco: "Projeto com alta probabilidade de atraso"
- Recomendação: "Realocar recursos ou revisar escopo"
- Próximo Passo: "Reunião emergencial com stakeholders"
```

### Caso 2: Otimização de Recursos
```
Situação: Projeto usando 90% do orçamento com 95% completo

IA Sugere:
- Health Score: 75% (Bom)
- Risco: "Orçamento próximo do limite"
- Recomendação: "Evitar scope creep nas etapas finais"
- Próximo Passo: "Finalizar entregáveis existentes"
```

### Caso 3: Projeto Exemplar
```
Situação: Projeto no prazo, orçamento ok, equipe produtiva

IA Reconhece:
- Health Score: 92% (Excelente)
- Riscos: "Nenhum risco significativo"
- Recomendação: "Documentar práticas para replicar sucesso"
- Próximo Passo: "Preparar case de sucesso"
```

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica
```
Frontend (React)
    ↓
  Nginx (/ai/*)
    ↓
Microserviço IA (Node.js:3002)
    ├── LangChain (Orchestration)
    ├── LangGraph (Workflows)
    └── OpenAI GPT-4 (Analysis)
```

### Endpoints da API
```bash
# Health Check
GET https://admin.sixquasar.pro/ai/health

# Análise de Projeto
POST https://admin.sixquasar.pro/ai/api/analyze/project/:id
Body: {
  projectName: string,
  status: string,
  progress: number,
  budgetUsed: number,
  deadline: string,
  description?: string
}
```

### Componentes React
```typescript
// Hook para análises
import { useAIAnalysis } from '@/hooks/use-ai-analysis';

// Componente de visualização
import { ProjectAIAnalysis } from '@/components/projects/ProjectAIAnalysis';
```

---

## 🔧 Troubleshooting

### Problema: "Análise IA temporariamente indisponível"
**Soluções**:
1. Verificar se o microserviço está rodando: `systemctl status team-manager-ai`
2. Verificar logs: `journalctl -u team-manager-ai -f`
3. Testar diretamente: `curl http://localhost:3002/health`

### Problema: Análise retorna sempre os mesmos valores
**Soluções**:
1. Verificar se OPENAI_API_KEY está configurada
2. Verificar se está usando análise real (ai_powered: true)
3. Limpar cache do navegador

### Problema: Erro 404 ao acessar IA
**Soluções**:
1. Verificar configuração Nginx: `nginx -t`
2. Verificar rotas: `grep -A 5 "location /ai" /etc/nginx/sites-available/team-manager`
3. Recarregar Nginx: `systemctl reload nginx`

---

## 🚀 Próximas Features

### Em Desenvolvimento
1. **Dashboard IA** - Visão consolidada de todos projetos
2. **Análise de Equipe** - Performance e alocação
3. **Previsões** - Estimativas de conclusão com ML
4. **Automações** - Ações automáticas baseadas em análises

### Roadmap
- Q3 2025: Cache inteligente com Redis
- Q3 2025: Rate limiting e quotas por usuário
- Q4 2025: Análise de documentos (PDF/DOCX)
- Q4 2025: Integração com Slack/Teams

---

## 📞 Suporte

### Logs e Monitoramento
```bash
# Ver logs do microserviço IA
journalctl -u team-manager-ai -f

# Ver logs do Nginx
tail -f /var/log/nginx/team-manager.access.log

# Monitorar uso de API
grep "analyze/project" /var/log/nginx/team-manager.access.log | wc -l
```

### Contato
- **Issues**: https://github.com/busque-ai/team-manager/issues
- **Email**: suporte@sixquasar.pro
- **Docs**: https://docs.sixquasar.pro/ai

---

## 🎉 Conclusão

O sistema de IA do Team Manager é uma ferramenta poderosa para melhorar a gestão de projetos. Use-a como um assistente inteligente que fornece insights valiosos, mas sempre aplique seu julgamento profissional.

**Lembre-se**: A IA é uma ferramenta, não um substituto para boa gestão! 🚀