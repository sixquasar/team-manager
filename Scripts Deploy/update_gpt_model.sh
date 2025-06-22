#!/bin/bash

#################################################################
#                                                               #
#        ATUALIZAR MODELO GPT PARA VERSÃO MINI                 #
#        Muda para gpt-4o-mini (mais barato e rápido)         #
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

echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${AZUL}🔄 ATUALIZANDO MODELO GPT PARA VERSÃO MINI${RESET}"
echo -e "${AZUL}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Executar no servidor
ssh $SERVER << 'ENDSSH'
cd /var/www/team-manager-ai

echo -e "\033[1;33m1. Fazendo backup dos arquivos atuais...\033[0m"
cp src/agents/projectAnalyzer.js src/agents/projectAnalyzer.js.bak

echo -e "\033[1;33m2. Atualizando projectAnalyzer.js para usar gpt-4o-mini...\033[0m"

# Atualizar o arquivo para usar gpt-4o-mini
cat > src/agents/projectAnalyzer.js << 'EOFILE'
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

// Parser para estruturar a resposta
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    healthScore: z.number().min(0).max(100).describe("Pontuação de saúde do projeto de 0 a 100"),
    risks: z.array(z.string()).describe("Lista de riscos identificados"),
    recommendations: z.array(z.string()).describe("Lista de recomendações"),
    nextSteps: z.array(z.string()).describe("Próximos passos sugeridos")
  })
);

// Template do prompt
const analysisPromptTemplate = new PromptTemplate({
  template: `Analise o seguinte projeto e forneça insights acionáveis:

Nome do Projeto: {projectName}
Status: {status}
Progresso: {progress}%
Orçamento Usado: {budgetUsed}%
Prazo: {deadline}
Descrição: {description}

{format_instructions}

Forneça uma análise concisa e prática, focando em:
1. Health Score baseado no progresso vs prazo e orçamento
2. Riscos principais (máximo 3)
3. Recomendações práticas (máximo 3)
4. Próximos passos imediatos (máximo 3)

Análise:`,
  inputVariables: ['projectName', 'status', 'progress', 'budgetUsed', 'deadline', 'description'],
  partialVariables: { format_instructions: parser.getFormatInstructions() }
});

// Função principal de análise
export async function analyzeProject(projectData) {
  try {
    // Configurar modelo - USANDO GPT-4O-MINI
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4o-mini',  // Modelo mini mais econômico
      maxTokens: 500,            // Limitar tokens para economizar
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Formatar o prompt
    const prompt = await analysisPromptTemplate.format({
      projectName: projectData.projectName || 'Projeto sem nome',
      status: projectData.status || 'indefinido',
      progress: projectData.progress || 0,
      budgetUsed: projectData.budgetUsed || 0,
      deadline: projectData.deadline || 'Não definido',
      description: projectData.description || 'Sem descrição'
    });

    console.log('🤖 Analisando projeto com GPT-4o-mini...');
    
    // Fazer a chamada
    const response = await model.invoke(prompt);
    
    // Parsear a resposta
    const analysis = await parser.parse(response.content);
    
    console.log('✅ Análise concluída com GPT-4o-mini');
    
    return {
      ...analysis,
      ai_powered: true,
      model_used: 'gpt-4o-mini'
    };
    
  } catch (error) {
    console.error('❌ Erro na análise com GPT-4o-mini:', error);
    
    // Retornar análise fallback
    return {
      healthScore: 70,
      risks: [
        'Análise automática temporariamente indisponível',
        'Usando valores padrão de referência'
      ],
      recommendations: [
        'Verificar configuração da API',
        'Tentar novamente em alguns minutos'
      ],
      nextSteps: [
        'Monitorar progresso manualmente',
        'Atualizar dados do projeto'
      ],
      ai_powered: false,
      model_used: 'fallback'
    };
  }
}
EOFILE

echo -e "\033[1;33m3. Atualizando index.js para mostrar modelo usado...\033[0m"

# Adicionar log do modelo no index.js
sed -i '/AI Service Running/a\          model: '\''gpt-4o-mini'\'',' src/index.js

echo -e "\033[1;33m4. Reiniciando microserviço IA...\033[0m"
systemctl restart team-manager-ai

echo -e "\033[1;33m5. Verificando se está rodando...\033[0m"
sleep 3
systemctl status team-manager-ai --no-pager | head -n 10

echo -e "\033[1;33m6. Testando endpoint...\033[0m"
curl -s http://localhost:3002/health | jq .

echo -e "\033[0;32m✅ Modelo atualizado para gpt-4o-mini!\033[0m"

# Mostrar logs para verificar
echo -e "\033[1;33m7. Últimos logs do serviço:\033[0m"
journalctl -u team-manager-ai -n 20 --no-pager | grep -E "GPT|model|Analisando"

ENDSSH

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}✅ MODELO ATUALIZADO PARA GPT-4O-MINI!${RESET}"
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${AZUL}📊 COMPARAÇÃO DE MODELOS:${RESET}"
echo ""
echo -e "${AMARELO}GPT-4 (anterior):${RESET}"
echo -e "  • Custo: ~\$0.03 por 1K tokens (input)"
echo -e "  • Mais poderoso mas mais caro"
echo -e "  • Velocidade: Mais lento"
echo ""
echo -e "${VERDE}GPT-4o-mini (novo):${RESET}"
echo -e "  • Custo: ~\$0.00015 por 1K tokens (input) - 200x mais barato!"
echo -e "  • Rápido e eficiente para análises"
echo -e "  • Velocidade: Muito mais rápido"
echo -e "  • Ideal para análises de projetos"
echo ""
echo -e "${AZUL}🔍 VERIFICAR:${RESET}"
echo -e "  1. Abra um projeto no Team Manager"
echo -e "  2. A análise agora usa GPT-4o-mini"
echo -e "  3. Deve ser mais rápida e econômica"
echo ""
echo -e "${AMARELO}💡 DICA:${RESET}"
echo -e "  O GPT-4o-mini é perfeito para análises de projeto"
echo -e "  pois é otimizado para tarefas estruturadas!"
echo ""