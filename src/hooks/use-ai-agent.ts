import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';

export function useAIAgent(agentType: string) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { equipe } = useAuth();
  
  const analyze = useCallback(async (data: any, context: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Conectar ao microserviço IA real em produção
      const response = await fetch(`/ai/api/agents/${agentType}/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          context: {
            ...context,
            equipe_id: equipe?.id,
            historicalData: true,
            includeRecommendations: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
        return result.analysis;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('AI Agent error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao analisar');
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentType, equipe]);
  
  const chat = useCallback(async (message: string, context: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/ai/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context: {
            ...context,
            equipe_id: equipe?.id
          },
          agentType
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return result.response;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setError(error instanceof Error ? error.message : 'Erro no chat');
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentType, equipe]);
  
  return { 
    analyze, 
    chat, 
    analysis, 
    loading, 
    error 
  };
}