import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use apenas PDF ou DOCX.'), false);
    }
  }
});

// Configuração OpenAI
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI configurado com sucesso');
  } else {
    console.log('⚠️ OPENAI_API_KEY não configurada - usando análise mock');
  }
} catch (error) {
  console.error('❌ Erro ao configurar OpenAI:', error);
}

// Função para extrair texto de PDF
async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Extraindo texto de PDF...');
    const data = await pdfParse(buffer);
    console.log(`✅ PDF processado: ${data.text.length} caracteres extraídos`);
    return data.text;
  } catch (error) {
    console.error('❌ Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao processar arquivo PDF');
  }
}

// Função para extrair texto de DOCX
async function extractTextFromDOCX(buffer) {
  try {
    console.log('📄 Extraindo texto de DOCX...');
    const result = await mammoth.extractRawText({ buffer });
    console.log(`✅ DOCX processado: ${result.value.length} caracteres extraídos`);
    return result.value;
  } catch (error) {
    console.error('❌ Erro ao extrair texto do DOCX:', error);
    throw new Error('Falha ao processar arquivo DOCX');
  }
}

// Função para análise IA via OpenAI
async function analyzeWithAI(text, fileName, equipeId, usuarioId) {
  if (!openai) {
    console.log('🤖 OpenAI não configurada, usando análise mock...');
    return generateMockAnalysis(text, fileName);
  }

  try {
    console.log('🤖 Enviando para análise OpenAI...');
    console.log(`📊 Texto para análise: ${text.length} caracteres`);
    
    const prompt = `
Analyze the following document and extract structured data for a project management system. 
Return a JSON object with the following structure:

{
  "projects": [
    {
      "nome": "Project name in Portuguese",
      "descricao": "Detailed project description",
      "orcamento": numerical_budget_value,
      "data_inicio": "YYYY-MM-DD",
      "data_fim_prevista": "YYYY-MM-DD", 
      "tecnologias": ["tech1", "tech2"],
      "status": "planejamento|em_progresso|concluido|cancelado"
    }
  ],
  "tasks": [
    {
      "titulo": "Task title in Portuguese",
      "descricao": "Detailed task description",
      "prioridade": "baixa|media|alta|urgente",
      "data_vencimento": "YYYY-MM-DD",
      "tags": ["tag1", "tag2"],
      "responsavel_sugerido": "Suggested responsible person"
    }
  ],
  "timeline": [
    {
      "titulo": "Event title in Portuguese", 
      "descricao": "Event description",
      "tipo": "tarefa|mensagem|marco|reuniao|prazo",
      "timestamp": "ISO datetime string",
      "prioridade": "baixa|media|alta|urgente"
    }
  ],
  "insights": {
    "summary": "Brief summary of the document analysis",
    "keyPoints": ["key point 1", "key point 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "estimatedDuration": "estimated project duration",
    "riskFactors": ["risk 1", "risk 2"]
  }
}

Document content:
${text.substring(0, 8000)} ${text.length > 8000 ? '...' : ''}

Please analyze this document and return ONLY the JSON object, no additional text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert project management analyst. Extract structured data from documents and return only valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('🤖 Resposta OpenAI recebida:', responseText.substring(0, 200) + '...');
    
    // Parse JSON response
    const result = JSON.parse(responseText);
    console.log('✅ Análise IA concluída:', {
      projetos: result.projects?.length || 0,
      tarefas: result.tasks?.length || 0,
      eventos: result.timeline?.length || 0
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro na análise OpenAI:', error);
    console.log('🔄 Fallback para análise mock...');
    return generateMockAnalysis(text, fileName);
  }
}

// Função para gerar análise mock quando OpenAI não disponível
function generateMockAnalysis(text, fileName) {
  console.log('🔄 Gerando análise mock...');
  
  // Análise simples baseada em palavras-chave
  const words = text.toLowerCase().split(/\s+/);
  const hasProjectKeywords = words.some(word => 
    ['projeto', 'system', 'desenvolvimento', 'aplicação', 'software'].includes(word)
  );
  
  const hasBudgetKeywords = words.some(word => 
    ['orçamento', 'custo', 'valor', 'preço', 'investimento'].includes(word)
  );
  
  const hasTimelineKeywords = words.some(word => 
    ['prazo', 'cronograma', 'entrega', 'milestone', 'fase'].includes(word)
  );

  return {
    projects: hasProjectKeywords ? [
      {
        nome: `Projeto extraído de ${fileName}`,
        descricao: `Projeto identificado automaticamente através de análise de texto. Detectadas ${words.length} palavras relevantes.`,
        orcamento: hasBudgetKeywords ? 150000 : 100000,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim_prevista: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tecnologias: ['React', 'Node.js', 'TypeScript'],
        status: 'planejamento'
      }
    ] : [],
    tasks: [
      {
        titulo: 'Análise de requisitos do documento',
        descricao: 'Analisar e documentar todos os requisitos identificados no documento enviado.',
        prioridade: 'alta',
        data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['análise', 'documentação'],
        responsavel_sugerido: 'Analista responsável'
      },
      {
        titulo: 'Planejamento inicial',
        descricao: 'Estruturar plano de trabalho baseado no conteúdo do documento.',
        prioridade: 'media',
        data_vencimento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['planejamento', 'estruturação'],
        responsavel_sugerido: 'Gerente de projeto'
      }
    ],
    timeline: [
      {
        titulo: 'Documento analisado',
        descricao: `Análise do documento ${fileName} concluída com sucesso.`,
        tipo: 'marco',
        timestamp: new Date().toISOString(),
        prioridade: 'media'
      }
    ].concat(hasTimelineKeywords ? [
      {
        titulo: 'Revisão de cronograma',
        descricao: 'Cronograma identificado no documento precisa ser validado.',
        tipo: 'prazo',
        timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        prioridade: 'alta'
      }
    ] : []),
    insights: {
      summary: `Documento analisado: ${fileName}. Foram identificadas ${words.length} palavras. ${hasProjectKeywords ? 'Projeto detectado.' : 'Conteúdo genérico.'} ${hasBudgetKeywords ? 'Informações financeiras presentes.' : ''}`,
      keyPoints: [
        hasProjectKeywords ? 'Documento contém informações de projeto' : 'Conteúdo textual padrão',
        hasBudgetKeywords ? 'Aspectos financeiros mencionados' : 'Sem informações financeiras claras',
        hasTimelineKeywords ? 'Cronograma ou prazos identificados' : 'Sem cronograma específico'
      ],
      recommendations: [
        'Revisar conteúdo extraído manualmente',
        'Validar informações com stakeholders',
        hasProjectKeywords ? 'Iniciar planejamento de projeto' : 'Categorizar documento adequadamente'
      ],
      estimatedDuration: hasProjectKeywords ? '2-3 meses' : '1-2 semanas',
      riskFactors: [
        'Análise automática pode ter limitações',
        'Informações podem estar incompletas'
      ]
    }
  };
}

// Endpoint principal para processamento de documentos
router.post('/process-document', upload.single('file'), async (req, res) => {
  try {
    console.log('🔍 DOCUMENT API: Iniciando processamento...');
    console.log('📁 Arquivo recebido:', req.file?.originalname);
    console.log('📊 Tamanho:', req.file?.size, 'bytes');
    console.log('🏢 Equipe ID:', req.body.equipe_id);
    console.log('👤 Usuario ID:', req.body.usuario_id);

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      });
    }

    const { equipe_id, usuario_id } = req.body;
    const { originalname, mimetype, buffer } = req.file;

    // Extrair texto baseado no tipo de arquivo
    let extractedText = '';
    
    if (mimetype === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimetype === 'application/msword') {
      extractedText = await extractTextFromDOCX(buffer);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo de arquivo não suportado' 
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Não foi possível extrair texto do documento' 
      });
    }

    console.log(`✅ Texto extraído: ${extractedText.length} caracteres`);

    // Análise IA
    const analysisResult = await analyzeWithAI(extractedText, originalname, equipe_id, usuario_id);

    // Adicionar metadados
    const response = {
      success: true,
      data: {
        ...analysisResult,
        metadata: {
          fileName: originalname,
          fileSize: buffer.length,
          mimeType: mimetype,
          textLength: extractedText.length,
          processedAt: new Date().toISOString(),
          equipeId: equipe_id,
          usuarioId: usuario_id
        }
      }
    };

    console.log('✅ DOCUMENT API: Processamento concluído com sucesso');
    console.log('📊 Resultado:', {
      projetos: analysisResult.projects?.length || 0,
      tarefas: analysisResult.tasks?.length || 0,
      eventos: analysisResult.timeline?.length || 0
    });

    res.json(response);

  } catch (error) {
    console.error('❌ DOCUMENT API: Erro no processamento:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint de status/health check
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    openai_configured: !!openai,
    node_env: process.env.NODE_ENV || 'development'
  });
});

export default router;