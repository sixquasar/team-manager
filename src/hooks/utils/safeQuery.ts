import { supabase } from '@/integrations/supabase/client';

// 🎯 LÓGICA PERFEITA - QUERIES ADAPTÁVEIS BASEADAS NA ESTRUTURA REAL

/**
 * Verifica a estrutura real de uma tabela no Supabase
 * Retorna array com nomes das colunas ou null se erro
 */
export const checkTableStructure = async (table: string): Promise<string[] | null> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.warn(`Erro ao verificar estrutura da tabela ${table}:`, error);
      return null;
    }
    
    // Retorna as colunas disponíveis
    return data && data.length > 0 ? Object.keys(data[0]) : [];
  } catch (err) {
    console.warn(`Erro inesperado ao verificar ${table}:`, err);
    return null;
  }
};

/**
 * Mapeamento inteligente de campos baseado nas auditorias realizadas
 * Prioridade: campo mais provável → fallbacks
 */
export const FIELD_MAPPING = {
  leads: {
    dateField: ['created_at', 'data_criacao', 'date', 'updated_at'],
    nameField: ['nome', 'name', 'cliente_nome'],
    clientField: ['nome', 'cliente', 'client_name']
  },
  projects: {
    dateField: ['datainicio', 'dataInicio', 'created_at', 'date'],
    clientField: ['cliente', 'cliente_nome', 'name'],
    statusField: ['status', 'estado', 'state']
  },
  proposals: {
    dateField: ['created_at', 'data', 'date'],
    clientField: ['cliente_nome', 'cliente', 'name'],
    valueField: ['valor_total', 'valor', 'value', 'price']
  },
  installations: {
    dateField: ['created_at', 'scheduled_date', 'data_instalacao', 'date'],
    clientField: ['cliente', 'cliente_nome', 'name'],
    powerField: ['potencia', 'potencia_kwp', 'power', 'kwp']
  }
} as const;

/**
 * Encontra o primeiro campo existente na estrutura da tabela
 */
export const findExistingField = (
  structure: string[] | null, 
  possibleFields: string[]
): string | null => {
  if (!structure) return null;
  
  return possibleFields.find(field => structure.includes(field)) || null;
};

/**
 * Query universal adaptável que se adapta à estrutura real da tabela
 */
export const universalFetch = async (
  table: string, 
  config: {
    limit?: number;
    company_id?: string;
    orderBy?: 'date' | 'name' | 'status';
    ascending?: boolean;
    filters?: Record<string, any>;
  } = {}
) => {
  try {
    // 1. Verificar estrutura real da tabela
    const structure = await checkTableStructure(table);
    
    if (!structure) {
      throw new Error(`Não foi possível acessar a tabela ${table}`);
    }
    
    // 2. Iniciar query básica
    let query = supabase.from(table).select('*');
    
    // 3. Aplicar filtro de empresa se disponível
    if (config.company_id && structure.includes('company_id')) {
      query = query.eq('company_id', config.company_id);
    }
    
    // 4. Aplicar filtros customizados
    if (config.filters) {
      Object.entries(config.filters).forEach(([field, value]) => {
        if (structure.includes(field)) {
          query = query.eq(field, value);
        }
      });
    }
    
    // 5. Aplicar ordenação inteligente se solicitada
    if (config.orderBy && FIELD_MAPPING[table as keyof typeof FIELD_MAPPING]) {
      const mapping = FIELD_MAPPING[table as keyof typeof FIELD_MAPPING];
      let orderField: string | null = null;
      
      switch (config.orderBy) {
        case 'date':
          orderField = findExistingField(structure, mapping.dateField || []);
          break;
        case 'name':
          orderField = findExistingField(structure, mapping.clientField || []);
          break;
        case 'status':
          orderField = findExistingField(structure, (mapping as any).statusField || []);
          break;
      }
      
      if (orderField) {
        query = query.order(orderField, { ascending: config.ascending || false });
      }
    }
    
    // 6. Aplicar limite
    if (config.limit) {
      query = query.limit(config.limit);
    }
    
    return await query;
    
  } catch (error) {
    console.error(`Erro em universalFetch para ${table}:`, error);
    throw error;
  }
};

/**
 * Query segura com fallback automático
 * Se a query principal falhar, retorna dados mock ou array vazio
 */
export const safeUniversalFetch = async (
  table: string,
  config: Parameters<typeof universalFetch>[1] = {},
  fallbackData: any[] = []
) => {
  try {
    const result = await universalFetch(table, config);
    return {
      data: result.data || [],
      error: result.error,
      fromFallback: false
    };
  } catch (error) {
    console.warn(`Query falhou para ${table}, usando fallback:`, error);
    return {
      data: fallbackData,
      error: null,
      fromFallback: true
    };
  }
};

/**
 * Utilitário para normalizar dados vindos de diferentes estruturas
 */
export const normalizeData = (
  data: any[], 
  table: string,
  mapping: Record<string, string> = {}
) => {
  const tableMapping = FIELD_MAPPING[table as keyof typeof FIELD_MAPPING];
  if (!tableMapping) return data;
  
  return data.map(item => {
    const normalized: any = { ...item };
    
    // Aplicar mapeamentos específicos
    Object.entries(mapping).forEach(([standardField, sourceField]) => {
      if (item[sourceField] !== undefined) {
        normalized[standardField] = item[sourceField];
      }
    });
    
    return normalized;
  });
};

/**
 * Cache simples para estruturas de tabelas (evita verificações repetidas)
 */
const structureCache = new Map<string, { structure: string[] | null, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const getCachedStructure = async (table: string): Promise<string[] | null> => {
  const cached = structureCache.get(table);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.structure;
  }
  
  const structure = await checkTableStructure(table);
  structureCache.set(table, { structure, timestamp: now });
  
  return structure;
};