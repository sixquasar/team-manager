import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send,
  Search,
  Plus,
  MoreHorizontal,
  Paperclip,
  Smile,
  Hash,
  Lock,
  Users,
  MessageSquare,
  Star,
  Pin,
  Brain,
  Heart,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Info,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { useMessages, Channel, Message } from '@/hooks/use-messages';
import { NewChannelModal } from '@/components/messages/NewChannelModal';
import { MessageActionsModal } from '@/components/messages/MessageActionsModal';
import { useAI } from '@/contexts/AIContext';
import { AIInsightsCard } from '@/components/ai/AIInsightsCard';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function Messages() {
  const { equipe, usuario } = useAuth();
  const navigate = useNavigate();
  const { 
    channels, 
    messages, 
    loading, 
    activeChannel, 
    setActiveChannel, 
    sendMessage, 
    getChannelMessages,
    createChannel,
    deleteMessage,
    editMessage,
    refetch
  } = useMessages();
  const { isAIEnabled, analyzeMessages, chatWithAI } = useAI();
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Estados para IA
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [topics, setTopics] = useState<string[]>([]);
  const [urgentMessages, setUrgentMessages] = useState<number>(0);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');

  // Análise de sentimento e tópicos em tempo real
  useEffect(() => {
    const analyzeConversation = async () => {
      if (!isAIEnabled || messages.length === 0) return;
      
      try {
        const analysis = await analyzeMessages(messages);
        setSentiment(analysis.sentiment || 'neutral');
        setTopics(analysis.topics || []);
        
        // Detectar mensagens urgentes
        const urgentKeywords = ['urgente', 'crítico', 'problema', 'erro', 'bug', 'asap', 'agora'];
        const urgent = messages.filter(m => 
          urgentKeywords.some(keyword => 
            m.conteudo.toLowerCase().includes(keyword)
          )
        ).length;
        setUrgentMessages(urgent);
      } catch (error) {
        console.error('Erro na análise:', error);
      }
    };
    
    analyzeConversation();
  }, [messages, isAIEnabled]);

  // Gerar sugestões de resposta
  const generateResponseSuggestions = async () => {
    if (!isAIEnabled || messages.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const lastMessages = messages.slice(-5); // Últimas 5 mensagens
      const context = lastMessages.map(m => `${m.autor}: ${m.conteudo}`).join('\n');
      
      const suggestions = await chatWithAI(
        `Sugira 3 respostas curtas e profissionais para esta conversa:\n${context}`,
        { type: 'response_suggestions' }
      );
      
      // Parse das sugestões
      const suggestionsList = suggestions.split('\n')
        .filter(s => s.trim())
        .slice(0, 3);
      
      setSuggestedResponses(suggestionsList);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sumarizar conversa
  const summarizeConversation = async () => {
    if (!isAIEnabled || messages.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const conversationText = messages
        .map(m => `${m.autor}: ${m.conteudo}`)
        .join('\n');
      
      const summary = await chatWithAI(
        `Faça um resumo executivo desta conversa em 3-5 pontos principais:\n${conversationText}`,
        { type: 'conversation_summary' }
      );
      
      setConversationSummary(summary);
      setShowSummary(true);
      
      toast({
        title: "Resumo gerado",
        description: "A conversa foi sumarizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao sumarizar",
        description: "Não foi possível gerar o resumo",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-primary"></div>
      </div>
    );
  }

  // Usar dados do hook useMessages conectado ao Supabase
  const filteredMessages = getChannelMessages(selectedChannel).filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    console.log('📤 Enviando mensagem para canal:', selectedChannel);
    const result = await sendMessage(selectedChannel, messageText);
    if (result.success) {
      setMessageText('');
      console.log('✅ Mensagem enviada com sucesso');
    } else {
      console.error('❌ Erro ao enviar mensagem:', result.error);
      alert('Erro ao enviar mensagem: ' + result.error);
    }
  };

  const handleCreateChannel = async (name: string, description: string, type: 'public' | 'private') => {
    console.log('📝 Criando novo canal:', { name, description, type });
    const result = await createChannel(name, description, type);
    if (result.success) {
      console.log('✅ Canal criado com sucesso');
      refetch(); // Recarregar canais
    }
    return result;
  };

  const handleMessageAction = (message: Message) => {
    console.log('⚙️ Ações para mensagem:', message.id);
    setSelectedMessage(message);
    setShowMessageActions(true);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    console.log('✏️ Editando mensagem:', messageId);
    const result = await editMessage(messageId, newContent);
    if (result.success) {
      console.log('✅ Mensagem editada com sucesso');
    }
    return result;
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log('🗑️ Deletando mensagem:', messageId);
    const result = await deleteMessage(messageId);
    if (result.success) {
      console.log('✅ Mensagem deletada com sucesso');
    }
    return result;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === 'direct') return MessageSquare;
    if (channel.type === 'private') return Lock;
    return Hash;
  };

  return (
    <div className="space-y-4">
      {/* AI Insights e Análise de Sentimento */}
      {isAIEnabled && messages.length > 0 && (
        <div className="space-y-4">
          <AIInsightsCard 
            title="Análise de Comunicação da Equipe"
            data={messages}
            analysisType="messages"
            className="shadow-lg border-purple-200"
          />
          
          {/* Sentiment and Topics Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sentimento Geral:</span>
                    <Badge className={
                      sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                      sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {sentiment === 'positive' ? <Heart className="h-3 w-3 mr-1" /> :
                       sentiment === 'negative' ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
                      {sentiment === 'positive' ? 'Positivo' : 
                       sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                    </Badge>
                  </div>
                  
                  {urgentMessages > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{urgentMessages} mensagens urgentes</span>
                    </div>
                  )}
                  
                  {topics.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Tópicos:</span>
                      <div className="flex gap-1">
                        {topics.slice(0, 3).map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={summarizeConversation}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    Sumarizar
                  </Button>
                  
                  {isAIEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/communication-workflow')}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Workflow IA
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Conversation Summary */}
          {showSummary && conversationSummary && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Resumo da Conversa
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowSummary(false)}
                    className="h-8 w-8"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{conversationSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex h-[calc(100vh-300px)] bg-white rounded-lg shadow">
        {/* Sidebar - Channels */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {equipe?.nome || 'Mensagens'}
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewChannel(true)}
              title="Criar novo canal"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="mb-4">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Canais
              </h3>
              {channels.filter(c => c.type === 'public').map(channel => {
                const IconComponent = getChannelIcon(channel);
                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-gray-100 ${
                      selectedChannel === channel.id ? 'bg-team-primary/10 text-team-primary' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{channel.name}</span>
                    </div>
                    {channel.unreadCount! > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {channel.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const channel = channels.find(c => c.id === selectedChannel);
                const IconComponent = channel ? getChannelIcon(channel) : Hash;
                return (
                  <>
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {channel?.name || 'Canal'}
                      </h3>
                      {channel?.description && (
                        <p className="text-xs text-gray-500">{channel.description}</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700">
                <Users className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Star className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map(message => (
                <div key={message.id} className="group flex space-x-3 p-4 hover:bg-gray-50">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-team-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {message.authorName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {message.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.edited && (
                        <span className="text-xs text-gray-400">(editado)</span>
                      )}
                      {message.pinned && (
                        <Pin className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-sm text-gray-700">{message.content}</p>
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex space-x-1">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs"
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => handleMessageAction(message)}
                      title="Ações da mensagem"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem encontrada</p>
                <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    // Gerar sugestões quando usuário parar de digitar
                    if (isAIEnabled && e.target.value.length > 10) {
                      setTimeout(generateResponseSuggestions, 1000);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Enviar mensagem para #${channels.find(c => c.id === selectedChannel)?.name || 'canal'}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-team-primary focus:border-transparent"
                  rows={1}
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-team-primary text-white p-3 rounded-lg hover:bg-team-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          {/* AI Response Suggestions */}
          {isAIEnabled && suggestedResponses.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-600">Sugestões de resposta:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedResponses.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageText(suggestion);
                      setSuggestedResponses([]);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewChannelModal
        isOpen={showNewChannel}
        onClose={() => setShowNewChannel(false)}
        onChannelCreated={handleCreateChannel}
      />

      <MessageActionsModal
        isOpen={showMessageActions}
        onClose={() => {
          setShowMessageActions(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        currentUserId={usuario?.id || ''}
      />
      </div>
    </div>
  );
}