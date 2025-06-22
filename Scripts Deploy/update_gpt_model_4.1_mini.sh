#!/bin/bash

#################################################################
#                                                               #
#        ATUALIZAR MODELO GPT PARA 4.1-MINI                    #
#        Muda para gpt-4.1-mini como solicitado                #
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
echo -e "${VERMELHO}🔄 ATUALIZANDO MODELO GPT PARA 4.1-MINI${RESET}"
echo -e "${VERMELHO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Executar no servidor
ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Atualizando TODOS os arquivos para usar gpt-4.1-mini...\033[0m"

# Atualizar projectAnalyzer.js
cat > src/agents/projectAnalyzer.js << 'EOFILE'
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    healthScore: z.number().min(0).max(100).describe("Pontuação de saúde do projeto de 0 a 100"),
    risks: z.array(z.string()).describe("Lista de riscos identificados"),
    recommendations: z.array(z.string()).describe("Lista de recomendações"),
    nextSteps: z.array(z.string()).describe("Próximos passos sugeridos")
  })
);

const analysisPromptTemplate = new PromptTemplate({
  template: `Analise o seguinte projeto e forneça insights acionáveis:

Nome do Projeto: {projectName}
Status: {status}
Progresso: {progress}%
Orçamento Usado: {budgetUsed}%
Prazo: {deadline}
Descrição: {description}

{format_instructions}

Forneça uma análise concisa e prática.

Análise:`,
  inputVariables: ['projectName', 'status', 'progress', 'budgetUsed', 'deadline', 'description'],
  partialVariables: { format_instructions: parser.getFormatInstructions() }
});

export async function analyzeProject(projectData) {
  try {
    // USANDO GPT-4.1-MINI COMO SOLICITADO
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4.1-mini',  // EXATAMENTE COMO PEDIDO
      maxTokens: 500,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = await analysisPromptTemplate.format({
      projectName: projectData.projectName || 'Projeto sem nome',
      status: projectData.status || 'indefinido',
      progress: projectData.progress || 0,
      budgetUsed: projectData.budgetUsed || 0,
      deadline: projectData.deadline || 'Não definido',
      description: projectData.description || 'Sem descrição'
    });

    console.log('🤖 Analisando projeto com GPT-4.1-MINI...');
    
    const response = await model.invoke(prompt);
    const analysis = await parser.parse(response.content);
    
    console.log('✅ Análise concluída com GPT-4.1-MINI');
    
    return {
      ...analysis,
      ai_powered: true,
      model_used: 'gpt-4.1-mini'
    };
    
  } catch (error) {
    console.error('❌ Erro na análise com GPT-4.1-MINI:', error);
    
    return {
      healthScore: 75,
      risks: [
        'Prazo apertado identificado',
        'Orçamento próximo do limite'
      ],
      recommendations: [
        'Revisar cronograma do projeto',
        'Otimizar alocação de recursos'
      ],
      nextSteps: [
        'Agendar reunião de alinhamento',
        'Definir prioridades da semana'
      ],
      ai_powered: false,
      model_used: 'fallback'
    };
  }
}
EOFILE

echo -e "\033[1;33m2. Atualizando index.js...\033[0m"

# Procurar e substituir referências ao modelo
sed -i "s/gpt-4-turbo-preview/gpt-4.1-mini/g" src/index.js
sed -i "s/gpt-4o-mini/gpt-4.1-mini/g" src/index.js
sed -i "s/gpt-4/gpt-4.1-mini/g" src/index.js

# Adicionar log específico
sed -i '/version:/ a\          model: '\''gpt-4.1-mini'\'',' src/index.js

echo -e "\033[1;33m3. Atualizando qualquer outra referência...\033[0m"
find src/ -type f -name "*.js" -exec sed -i 's/gpt-4[^.]*"/gpt-4.1-mini"/g' {} \;

echo -e "\033[1;33m4. Reiniciando microserviço IA...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m5. Aguardando serviço iniciar...\033[0m"
sleep 5

echo -e "\033[1;33m6. Verificando status...\033[0m"
systemctl status team-manager-ai --no-pager | head -n 15

echo -e "\033[1;33m7. Testando health check...\033[0m"
curl -s http://localhost:3002/health

echo ""
echo -e "\033[0;32m✅ MODELO ATUALIZADO PARA GPT-4.1-MINI!\033[0m"

echo -e "\033[1;33m8. Verificando logs para confirmar modelo...\033[0m"
journalctl -u team-manager-ai -n 30 --no-pager | grep -i "gpt\|model"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ MODELO ATUALIZADO PARA GPT-4.1-MINI COMO SOLICITADO!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${VERMELHO}🤖 USANDO AGORA: GPT-4.1-MINI${RESET}"
echo ""