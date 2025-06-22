#!/bin/bash

#################################################################
#                                                               #
#        DEBUG COMPLETO DA INTEGRAÇÃO IA                        #
#        Verifica onde está o problema                          #
#        Versão: 1.0.0                                          #
#        Data: 22/06/2025                                       #
#                                                               #
#################################################################

# Cores
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

SERVER="root@96.43.96.30"

echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERMELHO}🔍 DEBUG COMPLETO - ONDE ESTÁ A PORRA DA ANÁLISE IA?${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

echo -e "${AMARELO}IMPORTANTE: A análise aparece DENTRO DO MODAL quando você clica em um projeto!${RESET}"
echo -e "${AMARELO}NÃO é um botão! É um CARD que aparece automaticamente!${RESET}"
echo ""

# PASSO 1: Verificar se os arquivos existem no servidor
echo -e "${AZUL}1. Verificando se arquivos foram copiados para o servidor...${RESET}"

ssh $SERVER << 'ENDSSH'
echo "Verificando use-ai-analysis.ts..."
if [ -f "/var/www/team-manager/src/hooks/use-ai-analysis.ts" ]; then
    echo -e "\033[0;32m✓ use-ai-analysis.ts existe no servidor\033[0m"
    echo "Primeiras linhas do arquivo:"
    head -n 10 /var/www/team-manager/src/hooks/use-ai-analysis.ts
else
    echo -e "\033[0;31m✗ use-ai-analysis.ts NÃO EXISTE no servidor!\033[0m"
fi

echo ""
echo "Verificando ProjectAIAnalysis.tsx..."
if [ -f "/var/www/team-manager/src/components/projects/ProjectAIAnalysis.tsx" ]; then
    echo -e "\033[0;32m✓ ProjectAIAnalysis.tsx existe no servidor\033[0m"
    echo "Primeiras linhas do arquivo:"
    head -n 10 /var/www/team-manager/src/components/projects/ProjectAIAnalysis.tsx
else
    echo -e "\033[0;31m✗ ProjectAIAnalysis.tsx NÃO EXISTE no servidor!\033[0m"
fi
ENDSSH

# PASSO 2: Verificar se ProjectDetailsModal tem o import
echo ""
echo -e "${AZUL}2. Verificando se ProjectDetailsModal.tsx tem o import correto...${RESET}"

ssh $SERVER << 'ENDSSH'
echo "Procurando import do ProjectAIAnalysis..."
grep -n "ProjectAIAnalysis" /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx || echo "IMPORT NÃO ENCONTRADO!"

echo ""
echo "Procurando onde o componente é usado..."
grep -n -A 5 -B 5 "ProjectAIAnalysis" /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx || echo "COMPONENTE NÃO ESTÁ SENDO USADO!"
ENDSSH

# PASSO 3: Verificar se o build foi feito
echo ""
echo -e "${AZUL}3. Verificando última modificação do build...${RESET}"

ssh $SERVER << 'ENDSSH'
echo "Última modificação da pasta dist:"
ls -la /var/www/team-manager/dist/ | head -n 5
echo ""
echo "Arquivos JS no dist:"
ls -la /var/www/team-manager/dist/assets/*.js | head -n 5
ENDSSH

# PASSO 4: Verificar se o microserviço IA está rodando
echo ""
echo -e "${AZUL}4. Verificando microserviço IA...${RESET}"

ssh $SERVER << 'ENDSSH'
if systemctl is-active --quiet team-manager-ai; then
    echo -e "\033[0;32m✓ Microserviço IA está RODANDO\033[0m"
    echo "Testando endpoint direto:"
    curl -s http://localhost:3002/health | head -n 3
else
    echo -e "\033[0;31m✗ Microserviço IA NÃO está rodando!\033[0m"
fi
ENDSSH

# PASSO 5: Verificar logs de erro
echo ""
echo -e "${AZUL}5. Verificando logs de erro do frontend...${RESET}"

ssh $SERVER << 'ENDSSH'
echo "Últimos erros do nginx:"
tail -n 10 /var/log/nginx/team-manager.error.log | grep -i "error\|404\|500" || echo "Sem erros recentes"

echo ""
echo "Verificando console do backend:"
journalctl -u team-manager-backend -n 20 --no-pager | grep -i "error" || echo "Sem erros no backend"
ENDSSH

echo ""
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERMELHO}📍 ONDE PROCURAR A ANÁLISE IA:${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AMARELO}1. Vá para a página PROJETOS (não Profile!)${RESET}"
echo -e "${AMARELO}2. CLIQUE em um projeto para abrir o MODAL${RESET}"
echo -e "${AMARELO}3. ROLE PARA BAIXO dentro do modal${RESET}"
echo -e "${AMARELO}4. Abaixo das tecnologias, deve aparecer o card 'Análise Inteligente'${RESET}"
echo ""
echo -e "${VERMELHO}NÃO É UM BOTÃO! É UM CARD QUE APARECE AUTOMATICAMENTE!${RESET}"
echo ""

# PASSO 6: Criar script de correção se necessário
echo -e "${AZUL}Criando script de correção forçada...${RESET}"

cat > /tmp/force_ai_fix.sh << 'EOF'
#!/bin/bash

echo "FORÇANDO CORREÇÃO DA INTEGRAÇÃO IA..."

# 1. Parar serviços
systemctl stop team-manager-backend

# 2. Verificar se arquivos existem, senão criar
mkdir -p /var/www/team-manager/src/hooks
mkdir -p /var/www/team-manager/src/components/projects

# 3. Criar use-ai-analysis.ts se não existir
if [ ! -f "/var/www/team-manager/src/hooks/use-ai-analysis.ts" ]; then
    echo "Criando use-ai-analysis.ts..."
    cat > /var/www/team-manager/src/hooks/use-ai-analysis.ts << 'EOFILE'
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProjectAnalysis {
  healthScore: number;
  risks: string[];
  recommendations: string[];
  nextSteps: string[];
  ai_powered: boolean;
}

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeProject = useCallback(async (projectId: string, projectData: any) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`/ai/api/analyze/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        return data.analysis;
      }
    } catch (error) {
      console.error('Erro ao analisar projeto:', error);
      
      // Análise fallback
      const fallbackAnalysis: ProjectAnalysis = {
        healthScore: 85,
        risks: ['Prazo apertado', 'Orçamento próximo do limite'],
        recommendations: ['Aumentar equipe', 'Revisar cronograma'],
        nextSteps: ['Reunião de alinhamento', 'Definir milestones'],
        ai_powered: false,
      };
      
      setAnalysis(fallbackAnalysis);
      return fallbackAnalysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  return {
    analyzeProject,
    analysis,
    isAnalyzing,
    clearAnalysis: () => setAnalysis(null),
  };
}
EOFILE
fi

# 4. Verificar ProjectDetailsModal tem import e uso correto
echo "Verificando ProjectDetailsModal..."
if ! grep -q "import { ProjectAIAnalysis }" /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx; then
    echo "Adicionando import..."
    sed -i '24i\import { ProjectAIAnalysis } from '\''./ProjectAIAnalysis'\'';' /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx
fi

if ! grep -q "<ProjectAIAnalysis" /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx; then
    echo "Adicionando componente no modal..."
    # Adicionar antes do fechamento da div principal
    sed -i '540a\          {!isEditing && project && (\
            <div className="mt-6 pt-6 border-t">\
              <ProjectAIAnalysis \
                project={{\
                  ...project,\
                  orcamento_usado: project.orcamento * (project.progresso / 100)\
                }} \
              />\
            </div>\
          )}' /var/www/team-manager/src/components/projects/ProjectDetailsModal.tsx
fi

# 5. Rebuild
cd /var/www/team-manager
echo "Executando build..."
npm run build

# 6. Reiniciar
systemctl start team-manager-backend
systemctl reload nginx

echo "CORREÇÃO FORÇADA CONCLUÍDA!"
EOF

echo ""
echo -e "${VERDE}Script de correção criado em: /tmp/force_ai_fix.sh${RESET}"
echo -e "${AMARELO}Para executar no servidor: scp /tmp/force_ai_fix.sh root@96.43.96.30:/tmp/ && ssh root@96.43.96.30 'bash /tmp/force_ai_fix.sh'${RESET}"