/**
 * UTILITÁRIOS UNIVERSAIS PARA CORREÇÃO SISTEMÁTICA
 * Criado para eliminar problemas recorrentes em toda aplicação
 */

/**
 * Formata data de forma segura, evitando "Invalid Date"
 */
export const formatDateSafe = (dateValue: any): string => {
  if (!dateValue) return '-';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('pt-BR');
};

/**
 * Normaliza dados entre estruturas mock e real
 */
export const normalizeLeadData = (lead: any) => {
  if (!lead) return null;
  
  return {
    id: lead.id,
    nome: lead.nome || lead.name || '',
    email: lead.email || '',
    telefone: lead.telefone || lead.phone || '',
    origem: lead.origem || lead.source || 'website',
    consumo_medio: lead.consumo_medio || (lead.consumption ? parseFloat(lead.consumption.replace(' kWh', '')) : null),
    localizacao: lead.localizacao || lead.address || '',
    status: lead.status || 'novo',
    created_at: lead.created_at || lead.data_criacao || lead.date,
  };
};

/**
 * Normaliza dados de projeto
 */
export const normalizeProjectData = (project: any) => {
  if (!project) return null;
  
  return {
    id: project.id,
    nome: project.nome || project.name || '',
    cliente_nome: project.cliente_nome || project.cliente || '',
    datainicio: project.datainicio || project.dataInicio || project.start_date,
    status: project.status || 'planejamento',
    potencia: project.potencia || project.potencia_kwp || 0,
  };
};

/**
 * Popula dados de formulário para modal de edição
 */
export const populateModalForm = (data: any, fieldMapping: Record<string, string[]>) => {
  const formData: Record<string, string> = {};
  
  Object.entries(fieldMapping).forEach(([formField, possibleKeys]) => {
    const value = possibleKeys.find(key => data[key] !== undefined && data[key] !== null);
    formData[formField] = value ? data[value].toString() : '';
  });
  
  return formData;
};