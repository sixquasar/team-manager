import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  memberCount?: number;
  unreadCount?: number;
  lastActivity: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  edited?: boolean;
  pinned?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export function useMessages() {
  const { equipe, usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');

  useEffect(() => {
    fetchChannelsAndMessages();
  }, [equipe]);

  const fetchChannelsAndMessages = async () => {
    try {
      setLoading(true);
      
      if (!equipe?.id) {
        console.log('🚨 MESSAGES: Sem equipe selecionada, usando dados SixQuasar');
        
        // Canais padrão da SixQuasar baseados nos projetos
        setChannels([
          {
            id: 'general',
            name: 'Geral',
            type: 'public',
            description: 'Discussões gerais da equipe SixQuasar',
            memberCount: 3,
            unreadCount: 0,
            lastActivity: '2h atrás'
          },
          {
            id: 'palmas-ia',
            name: 'Projeto Palmas IA',
            type: 'public',
            description: 'Sistema de Atendimento ao Cidadão - R$ 2.4M',
            memberCount: 3,
            unreadCount: 2,
            lastActivity: '30min atrás'
          },
          {
            id: 'jocum-sdk',
            name: 'Projeto Jocum SDK',
            type: 'public',
            description: 'Automação Multi-LLM - R$ 625K',
            memberCount: 3,
            unreadCount: 1,
            lastActivity: '1h atrás'
          },
          {
            id: 'dev-team',
            name: 'Desenvolvimento',
            type: 'private',
            description: 'Canal privado da equipe de desenvolvimento',
            memberCount: 3,
            unreadCount: 0,
            lastActivity: '4h atrás'
          }
        ]);

        // Mensagens baseadas nos projetos reais
        setMessages([
          {
            id: '1',
            channelId: 'palmas-ia',
            authorId: '550e8400-e29b-41d4-a716-446655440001',
            authorName: 'Ricardo Landim',
            content: 'Pessoal, finalizei a arquitetura do sistema para atender 350k habitantes. A infraestrutura está preparada para 99.9% de disponibilidade com AWS + Kubernetes.',
            timestamp: '2024-12-20T14:30:00Z'
          },
          {
            id: '2',
            channelId: 'palmas-ia',
            authorId: '550e8400-e29b-41d4-a716-446655440003',
            authorName: 'Rodrigo Marochi',
            content: 'Ótimo! Já comecei a integração com WhatsApp API. Vai ser crucial para atingir a meta de 1M mensagens/mês.',
            timestamp: '2024-12-20T14:35:00Z'
          },
          {
            id: '3',
            channelId: 'jocum-sdk',
            authorId: '550e8400-e29b-41d4-a716-446655440002',
            authorName: 'Leonardo Candiani',
            content: 'SDK multi-LLM funcionando! OpenAI + Anthropic + Gemini integrados. Conseguimos fallback automático entre os modelos.',
            timestamp: '2024-12-20T15:00:00Z'
          },
          {
            id: '4',
            channelId: 'jocum-sdk',
            authorId: '550e8400-e29b-41d4-a716-446655440001',
            authorName: 'Ricardo Landim',
            content: 'Excelente! Isso vai garantir os 50k atendimentos/dia que o cliente precisa. 🚀',
            timestamp: '2024-12-20T15:05:00Z',
            reactions: [
              { emoji: '🚀', count: 2, users: ['Leonardo Candiani', 'Rodrigo Marochi'] }
            ]
          },
          {
            id: '5',
            channelId: 'general',
            authorId: '550e8400-e29b-41d4-a716-446655440003',
            authorName: 'Rodrigo Marochi',
            content: 'Mapeei 80+ bases da Jocum para integração. VoIP + WhatsApp vai cobrir todos os canais de atendimento.',
            timestamp: '2024-12-20T16:00:00Z'
          },
          {
            id: '6',
            channelId: 'dev-team',
            authorId: '550e8400-e29b-41d4-a716-446655440001',
            authorName: 'Ricardo Landim',
            content: 'Pessoal, estamos com 25% do Palmas e 15% do Jocum. POCs entregam em 31/01. Vamos acelerar! 💪',
            timestamp: '2024-12-20T16:30:00Z',
            pinned: true,
            reactions: [
              { emoji: '💪', count: 3, users: ['Leonardo Candiani', 'Rodrigo Marochi', 'Ricardo Landim'] }
            ]
          }
        ]);
        
        setLoading(false);
        return;
      }

      console.log('✅ MESSAGES: Equipe encontrada, buscando mensagens do Supabase');
      
      // Em produção, buscaria canais e mensagens reais do Supabase
      // Por enquanto, usar dados SixQuasar
      setChannels([
        {
          id: 'general',
          name: 'Geral',
          type: 'public',
          description: 'Discussões gerais da equipe',
          memberCount: 3,
          unreadCount: 0,
          lastActivity: '2h atrás'
        }
      ]);

      setMessages([]);

    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      
      // Fallback para dados SixQuasar
      setChannels([
        {
          id: 'general',
          name: 'Geral',
          type: 'public',
          memberCount: 3,
          unreadCount: 0,
          lastActivity: '2h atrás'
        }
      ]);
      
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (channelId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        channelId,
        authorId: usuario?.id || '1',
        authorName: usuario?.nome || 'Usuário',
        content,
        timestamp: new Date().toISOString()
      };

      // Em produção, salvaria no Supabase
      setMessages(prev => [...prev, newMessage]);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: 'Erro ao enviar mensagem' };
    }
  };

  const addReaction = async (messageId: string, emoji: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            // Toggle reaction
            if (existingReaction.users.includes(usuario?.nome || '')) {
              existingReaction.count--;
              existingReaction.users = existingReaction.users.filter(u => u !== usuario?.nome);
            } else {
              existingReaction.count++;
              existingReaction.users.push(usuario?.nome || '');
            }
          } else {
            // Add new reaction
            if (!message.reactions) message.reactions = [];
            message.reactions.push({
              emoji,
              count: 1,
              users: [usuario?.nome || '']
            });
          }
        }
        return message;
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
      return { success: false, error: 'Erro ao adicionar reação' };
    }
  };

  const getChannelMessages = (channelId: string): Message[] => {
    return messages.filter(message => message.channelId === channelId);
  };

  return {
    loading,
    channels,
    messages,
    activeChannel,
    setActiveChannel,
    sendMessage,
    addReaction,
    getChannelMessages,
    refetch: fetchChannelsAndMessages
  };
}