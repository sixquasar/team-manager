import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Brain,
  Sparkles,
  FileSpreadsheet,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { useTimeline } from '@/hooks/use-timeline';

interface ProcessingResult {
  projects: Array<{
    nome: string;
    descricao: string;
    orcamento: number;
    data_inicio: string;
    data_fim_prevista: string;
    tecnologias: string[];
    status: string;
  }>;
  tasks: Array<{
    titulo: string;
    descricao: string;
    prioridade: string;
    data_vencimento: string;
    tags: string[];
    responsavel_sugerido: string;
  }>;
  timeline: Array<{
    titulo: string;
    descricao: string;
    tipo: string;
    timestamp: string;
    prioridade: string;
  }>;
  insights: {
    summary: string;
    keyPoints: string[];
    recommendations: string[];
    estimatedDuration: string;
    riskFactors: string[];
  };
}

export function DocumentUpload() {
  const { usuario, equipe } = useAuth();
  const { toast } = useToast();
  const { createProject } = useProjects();
  const { createTask } = useTasks();
  const { createEvent } = useTimeline();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    console.log('🔍 UPLOAD: Iniciando processamento de arquivos...');
    console.log('📁 Arquivos selecionados:', files.length);
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validações
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use apenas PDF ou DOCX.');
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos PDF e DOCX são suportados.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('Arquivo muito grande. Máximo 10MB.');
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStage('Preparando upload...');
    
    try {
      // Simular progresso de upload
      setProcessingStage('Enviando arquivo...');
      for (let i = 0; i <= 30; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setProcessingStage('Extraindo texto do documento...');
      for (let i = 30; i <= 50; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      setProcessingStage('Analisando com IA (OpenAI)...');
      for (let i = 50; i <= 80; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setProcessingStage('Estruturando dados extraídos...');
      for (let i = 80; i <= 95; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Processamento IA real via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('equipe_id', equipe?.id || '');
      formData.append('usuario_id', usuario?.id || '');
      
      console.log('🤖 Enviando para processamento IA...');
      
      // Fazer requisição para a API real
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no processamento do documento');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Falha no processamento');
      }
      
      // Usar resultado real da IA
      const aiResult: ProcessingResult = result.data;
      
      console.log('✅ Resultado IA recebido:', aiResult);
      
      setProcessingStage('Finalizando...');
      setUploadProgress(100);
      
      setResults(aiResult);
      
      toast({
        title: "Documento processado com sucesso!",
        description: `Foram extraídos ${aiResult.projects.length} projeto(s) e ${aiResult.tasks.length} tarefa(s).`,
      });
      
      console.log('✅ Processamento concluído:', aiResult);
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      setError('Erro ao processar documento. Tente novamente.');
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateEntities = async () => {
    if (!results || !equipe || !usuario) return;
    
    console.log('🔄 Criando entidades no sistema...');
    setIsProcessing(true);
    setProcessingStage('Integrando com sistema...');
    
    try {
      let createdCount = 0;
      let totalEntities = results.projects.length + results.tasks.length + results.timeline.length;
      
      // Criar projetos
      setProcessingStage('Criando projetos...');
      for (const project of results.projects) {
        try {
          const projectResult = await createProject({
            nome: project.nome,
            descricao: project.descricao,
            orcamento: project.orcamento,
            data_inicio: project.data_inicio,
            data_fim_prevista: project.data_fim_prevista,
            tecnologias: project.tecnologias,
            status: project.status,
            responsavel_id: usuario.id,
            equipe_id: equipe.id,
            progresso: 0
          });
          
          if (projectResult.success) {
            createdCount++;
            console.log('✅ Projeto criado:', project.nome);
          }
        } catch (error) {
          console.error('❌ Erro ao criar projeto:', project.nome, error);
        }
      }
      
      // Criar tarefas
      setProcessingStage('Criando tarefas...');
      for (const task of results.tasks) {
        try {
          const taskResult = await createTask({
            titulo: task.titulo,
            descricao: task.descricao,
            prioridade: task.prioridade,
            data_vencimento: task.data_vencimento,
            tags: task.tags,
            responsavel_id: usuario.id,
            equipe_id: equipe.id,
            status: 'pendente'
          });
          
          if (taskResult.success) {
            createdCount++;
            console.log('✅ Tarefa criada:', task.titulo);
          }
        } catch (error) {
          console.error('❌ Erro ao criar tarefa:', task.titulo, error);
        }
      }
      
      // Criar eventos do timeline
      setProcessingStage('Criando eventos...');
      for (const event of results.timeline) {
        try {
          const eventResult = await createEvent({
            titulo: event.titulo,
            descricao: event.descricao,
            tipo: event.tipo,
            prioridade: event.prioridade,
            autor_id: usuario.id,
            equipe_id: equipe.id,
            timestamp: event.timestamp,
            projeto: results.projects[0]?.nome || 'Documento Importado'
          });
          
          if (eventResult.success) {
            createdCount++;
            console.log('✅ Evento criado:', event.titulo);
          }
        } catch (error) {
          console.error('❌ Erro ao criar evento:', event.titulo, error);
        }
      }
      
      setProcessingStage('Finalizando integração...');
      
      if (createdCount > 0) {
        toast({
          title: "Integração concluída!",
          description: `${createdCount} de ${totalEntities} entidades foram criadas com sucesso.`,
        });
      } else {
        toast({
          title: "Integração parcial",
          description: "Algumas entidades podem não ter sido criadas. Verifique os logs.",
          variant: "destructive"
        });
      }
      
      console.log(`✅ Integração concluída: ${createdCount}/${totalEntities} entidades criadas`);
      
      // Reset do estado
      setResults(null);
      setUploadProgress(0);
      setProcessingStage('');
      
    } catch (error) {
      console.error('❌ Erro na integração:', error);
      setError('Erro ao integrar dados ao sistema.');
      toast({
        title: "Erro na integração",
        description: "Não foi possível integrar todos os dados ao sistema.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setResults(null);
    setError(null);
    setUploadProgress(0);
    setProcessingStage('');
  };

  if (results) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Análise IA Concluída
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetUpload}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Nova Análise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Resumo da Análise</h3>
            <p className="text-blue-800">{results.insights.summary}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                {results.insights.estimatedDuration}
              </Badge>
              <Badge variant="secondary">
                <Target className="h-3 w-3 mr-1" />
                {results.projects.length} Projeto(s)
              </Badge>
              <Badge variant="secondary">
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                {results.tasks.length} Tarefa(s)
              </Badge>
            </div>
          </div>

          {/* Projetos Extraídos */}
          {results.projects.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Projetos Identificados ({results.projects.length})
              </h3>
              <div className="space-y-2">
                {results.projects.map((project, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-green-50">
                    <h4 className="font-medium text-green-900">{project.nome}</h4>
                    <p className="text-sm text-green-700 mt-1">{project.descricao}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">R$ {project.orcamento.toLocaleString()}</Badge>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tarefas Extraídas */}
          {results.tasks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                Tarefas Identificadas ({results.tasks.length})
              </h3>
              <div className="space-y-2">
                {results.tasks.map((task, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-blue-50">
                    <h4 className="font-medium text-blue-900">{task.titulo}</h4>
                    <p className="text-sm text-blue-700 mt-1">{task.descricao}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{task.prioridade}</Badge>
                      <Badge variant="outline">{task.responsavel_sugerido}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights e Recomendações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-700">✅ Pontos Chave</h3>
              <ul className="text-sm space-y-1">
                {results.insights.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-amber-700">⚠️ Fatores de Risco</h3>
              <ul className="text-sm space-y-1">
                {results.insights.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={resetUpload}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEntities}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Integrando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Integrar ao Sistema
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Importação Inteligente de Documentos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Envie um documento (PDF ou DOCX) e a IA extrairá automaticamente projetos, tarefas e cronogramas.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <span className="font-medium">{processingStage}</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress}% concluído
            </p>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Arraste e solte seu documento aqui
            </h3>
            
            <p className="text-gray-600 mb-4">
              ou clique para selecionar arquivos
            </p>
            
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <label htmlFor="file-upload">
              <Button 
                asChild
                className="bg-purple-600 hover:bg-purple-700"
              >
                <span className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Selecionar Arquivo
                </span>
              </Button>
            </label>
            
            <p className="text-xs text-gray-500 mt-4">
              Suporta PDF e DOCX até 10MB
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}