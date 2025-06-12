
/**
 * Formata um valor para exibição como moeda BRL (R$)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formata uma data para exibição no formato brasileiro
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Formata um número com separadores de milhar
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Retorna a data atual formatada no padrão brasileiro
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

/**
 * Retorna o ano atual
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Retorna uma data atual formatada como string para o padrão brasileiro
 */
export const getCurrentFormattedDate = (): string => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
