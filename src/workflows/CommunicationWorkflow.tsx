import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Brain,
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Target,
  FileText,
  Send,
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useMessages } from '@/hooks/use-messages';
import { toast } from '@/hooks/use-toast';

interface CommunicationState {
  type: 'announcement' | 'discussion' | 'decision' | 'update' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  audience: string[];
  status: 'draft' | 'review' | 'approved' | 'sent';
  aiSuggestions?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export function CommunicationWorkflow() {
  const { isAIEnabled, chatWithAI, analyzeMessages } = useAI();
  const { channels, sendMessage } = useMessages();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [communication, setCommunication] = useState<CommunicationState>({
    type: 'announcement',
    priority: 'medium',
    audience: [],
    status: 'draft'
  });
  
  const [messageContent, setMessageContent] = useState('');
  const [aiImprovedMessage, setAiImprovedMessage] = useState('');
  const [targetChannels, setTargetChannels] = useState<string[]>([]);

  const steps = [
    { id: 1, name: 'Definir Tipo', icon: Target },
    { id: 2, name: 'Redigir Mensagem', icon: FileText },
    { id: 3, name: 'Análise IA', icon: Brain },
    { id: 4, name: 'Revisar e Aprovar', icon: CheckCircle2 },
    { id: 5, name: 'Enviar', icon: Send }
  ];

  const communicationTypes = [
    { value: 'announcement', label: 'Anúncio', icon: MessageSquare, color: 'blue' },
    { value: 'discussion', label: 'Discussão', icon: Users, color: 'green' },
    { value: 'decision', label: 'Decisão', icon: CheckCircle2, color: 'purple' },
    { value: 'update', label: 'Atualização', icon: TrendingUp, color: 'orange' },
    { value: 'alert', label: 'Alerta', icon: AlertTriangle, color: 'red' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Baixa', color: 'gray' },
    { value: 'medium', label: 'Média', color: 'yellow' },
    { value: 'high', label: 'Alta', color: 'orange' },
    { value: 'urgent', label: 'Urgente', color: 'red' }
  ];

  // Analisar e melhorar mensagem com IA
  const analyzeMessage = async () => {
    if (!isAIEnabled || !messageContent) return;
    
    setIsProcessing(true);
    try {
      // Analisar tom e clareza
      const analysis = await chatWithAI(
        `Analise esta mensagem corporativa e sugira melhorias para clareza, tom ${communication.type} e impacto:\n\n${messageContent}`,
        { type: 'message_analysis', communicationType: communication.type }
      );
      
      // Gerar versão melhorada
      const improved = await chatWithAI(
        `Reescreva esta mensagem mantendo o conteúdo mas melhorando clareza, profissionalismo e impacto para um ${communication.type}:\n\n${messageContent}`,
        { type: 'message_improvement' }
      );
      
      setAiImprovedMessage(improved);
      
      // Detectar sentimento
      const sentimentAnalysis = await analyzeMessages([{ conteudo: messageContent }]);
      setCommunication(prev => ({
        ...prev,
        sentiment: sentimentAnalysis.sentiment,
        aiSuggestions: [
          'Use linguagem mais assertiva no início',
          'Adicione call-to-action claro no final',
          'Considere dividir em parágrafos menores'
        ]
      }));
      
      toast({
        title: "Análise concluída",
        description: "A IA analisou e melhorou sua mensagem"
      });
      
      setCurrentStep(4);
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enviar mensagem para canais selecionados
  const sendCommunication = async () => {
    if (targetChannels.length === 0) {
      toast({
        title: "Selecione canais",
        description: "Escolha pelo menos um canal para enviar",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const finalMessage = aiImprovedMessage || messageContent;
      
      // Adicionar prefixo baseado no tipo e prioridade
      const prefix = communication.priority === 'urgent' ? '🚨 URGENTE: ' :
                    communication.type === 'announcement' ? '📢 ANÚNCIO: ' :
                    communication.type === 'decision' ? '✅ DECISÃO: ' :
                    communication.type === 'alert' ? '⚠️ ALERTA: ' : '';
      
      // Enviar para cada canal selecionado
      for (const channelId of targetChannels) {
        await sendMessage(channelId, prefix + finalMessage);
      }
      
      setCommunication(prev => ({ ...prev, status: 'sent' }));
      
      toast({
        title: "Mensagem enviada",
        description: `Enviada para ${targetChannels.length} canal(is)`,
      });
      
      setCurrentStep(5);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Selecione o tipo de comunicação</h3>
              <div className="grid grid-cols-2 gap-4">
                {communicationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${
                        communication.type === type.value
                          ? 'ring-2 ring-team-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setCommunication(prev => ({ ...prev, type: type.value as any }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                            <Icon className={`h-6 w-6 text-${type.color}-600`} />
                          </div>
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-gray-600">
                              {type.value === 'announcement' && 'Informar toda equipe'}
                              {type.value === 'discussion' && 'Iniciar conversa'}
                              {type.value === 'decision' && 'Comunicar decisão'}
                              {type.value === 'update' && 'Atualização de status'}
                              {type.value === 'alert' && 'Alerta importante'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Defina a prioridade</h3>
              <div className="flex gap-3">
                {priorityLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={communication.priority === level.value ? 'default' : 'outline'}
                    onClick={() => setCommunication(prev => ({ ...prev, priority: level.value as any }))}
                    className="flex-1"
                  >
                    <Badge className={`bg-${level.color}-100 text-${level.color}-700 mr-2`}>
                      {level.label}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Redija sua mensagem</h3>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={`Digite sua ${communication.type === 'announcement' ? 'mensagem de anúncio' : 
                            communication.type === 'discussion' ? 'proposta de discussão' :
                            communication.type === 'decision' ? 'decisão' :
                            communication.type === 'update' ? 'atualização' :
                            'alerta'} aqui...`}
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-600 mt-2">
                {messageContent.length} caracteres
              </p>
            </div>
            
            {isAIEnabled && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 mb-2">Dicas da IA:</p>
                      <ul className="space-y-1 text-sm text-purple-700">
                        {communication.type === 'announcement' && (
                          <>
                            <li>• Comece com o ponto principal</li>
                            <li>• Use linguagem clara e direta</li>
                            <li>• Inclua ação esperada ao final</li>
                          </>
                        )}
                        {communication.type === 'discussion' && (
                          <>
                            <li>• Apresente contexto completo</li>
                            <li>• Faça perguntas abertas</li>
                            <li>• Estabeleça prazo para respostas</li>
                          </>
                        )}
                        {communication.type === 'alert' && (
                          <>
                            <li>• Seja específico sobre o problema</li>
                            <li>• Indique ações imediatas necessárias</li>
                            <li>• Forneça contato para dúvidas</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-medium mb-2">Analisando com IA...</h3>
              <p className="text-gray-600">
                A inteligência artificial está analisando sua mensagem para:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>✓ Verificar clareza e objetividade</li>
                <li>✓ Analisar tom e sentimento</li>
                <li>✓ Sugerir melhorias de impacto</li>
                <li>✓ Otimizar para o tipo {communication.type}</li>
              </ul>
              <Progress value={75} className="mt-6 w-64 mx-auto" />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Revisar e Aprovar</h3>
            
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Mensagem Original</TabsTrigger>
                <TabsTrigger value="improved">Versão Melhorada IA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{messageContent}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="improved" className="mt-4">
                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Melhorada por IA</span>
                    </div>
                    <p className="whitespace-pre-wrap">{aiImprovedMessage || messageContent}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {communication.aiSuggestions && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-2">Sugestões de Melhoria:</p>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {communication.aiSuggestions.map((suggestion, idx) => (
                          <li key={idx}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div>
              <h4 className="font-medium mb-3">Selecione os canais de destino:</h4>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={targetChannels.includes(channel.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetChannels([...targetChannels, channel.id]);
                        } else {
                          setTargetChannels(targetChannels.filter(id => id !== channel.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="flex items-center gap-2">
                      {channel.type === 'private' ? <Lock className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      {channel.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Comunicação Enviada!</h3>
            <p className="text-gray-600 mb-4">
              Sua mensagem foi enviada para {targetChannels.length} canal(is)
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-700">
                Tipo: <Badge>{communication.type}</Badge>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Prioridade: <Badge className={`bg-${priorityLevels.find(p => p.value === communication.priority)?.color}-100`}>
                  {communication.priority}
                </Badge>
              </p>
              {communication.sentiment && (
                <p className="text-sm text-gray-700 mt-2">
                  Sentimento detectado: <Badge>{communication.sentiment}</Badge>
                </p>
              )}
            </div>
            <Button
              className="mt-6"
              onClick={() => {
                setCurrentStep(1);
                setMessageContent('');
                setAiImprovedMessage('');
                setTargetChannels([]);
                setCommunication({
                  type: 'announcement',
                  priority: 'medium',
                  audience: [],
                  status: 'draft'
                });
              }}
            >
              Nova Comunicação
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-purple-600" />
          Workflow de Comunicação Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${
                    isCompleted ? 'text-green-600' :
                    isActive ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-green-100 border-green-600' :
                      isActive ? 'bg-blue-100 border-blue-600' :
                      'bg-gray-100 border-gray-300'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className={`h-8 w-8 mx-2 ${
                      currentStep > step.id ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isProcessing}
          >
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            {isAIEnabled && (
              <Badge className="bg-purple-100 text-purple-700">
                <Brain className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            )}
          </div>
          
          {currentStep < 5 && (
            <Button
              onClick={() => {
                if (currentStep === 2 && isAIEnabled) {
                  analyzeMessage();
                } else if (currentStep === 4) {
                  sendCommunication();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={
                isProcessing ||
                (currentStep === 2 && !messageContent.trim()) ||
                (currentStep === 4 && targetChannels.length === 0)
              }
              className="bg-team-primary hover:bg-team-primary/90"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Processando...
                </>
              ) : currentStep === 2 && isAIEnabled ? (
                <>
                  Analisar com IA
                  <Brain className="h-4 w-4 ml-2" />
                </>
              ) : currentStep === 4 ? (
                <>
                  Enviar
                  <Send className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}