// ================================================================
// VALIDAÇÃO DE INPUT - SEGURANÇA
// Team Manager - SixQuasar
// ================================================================

/**
 * Valida e sanitiza email
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Email é obrigatório' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Email inválido' };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: 'Email muito longo' };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Valida senha com requisitos de segurança
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Senha muito longa' };
  }
  
  // Verificar complexidade básica
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  const complexity = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (complexity < 3) {
    return { 
      isValid: false, 
      error: 'Senha deve conter pelo menos 3 dos seguintes: letras minúsculas, maiúsculas, números, caracteres especiais' 
    };
  }
  
  return { isValid: true };
}

/**
 * Sanitiza texto removendo caracteres perigosos
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return '';
  
  // Remove tags HTML e scripts
  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  
  // Remove caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limita tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Valida nome de usuário/projeto
 */
export function validateName(name: string, fieldName: string = 'Nome'): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeText(name, 100).trim();
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: `${fieldName} é obrigatório` };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: `${fieldName} muito curto` };
  }
  
  // Verifica se contém apenas caracteres válidos
  const validNameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-._]+$/;
  if (!validNameRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: `${fieldName} contém caracteres inválidos` };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Valida valor monetário
 */
export function validateCurrency(value: string | number): { isValid: boolean; sanitized: number; error?: string } {
  let numValue: number;
  
  if (typeof value === 'string') {
    // Remove símbolos de moeda e espaços
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    numValue = parseFloat(cleaned);
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue)) {
    return { isValid: false, sanitized: 0, error: 'Valor inválido' };
  }
  
  if (numValue < 0) {
    return { isValid: false, sanitized: 0, error: 'Valor não pode ser negativo' };
  }
  
  if (numValue > 999999999) {
    return { isValid: false, sanitized: 0, error: 'Valor muito alto' };
  }
  
  // Arredonda para 2 casas decimais
  const sanitized = Math.round(numValue * 100) / 100;
  
  return { isValid: true, sanitized };
}

/**
 * Valida data
 */
export function validateDate(date: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!date) {
    return { isValid: false, sanitized: '', error: 'Data é obrigatória' };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, sanitized: date, error: 'Data inválida' };
  }
  
  // Verifica se a data está em um range razoável (1900-2100)
  const year = dateObj.getFullYear();
  if (year < 1900 || year > 2100) {
    return { isValid: false, sanitized: date, error: 'Ano inválido' };
  }
  
  return { isValid: true, sanitized: dateObj.toISOString() };
}

/**
 * Valida URL
 */
export function validateURL(url: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = url.trim();
  
  if (!sanitized) {
    return { isValid: true, sanitized: '' }; // URL pode ser opcional
  }
  
  try {
    const urlObj = new URL(sanitized);
    
    // Permite apenas http e https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, sanitized, error: 'Apenas URLs HTTP/HTTPS são permitidas' };
    }
    
    return { isValid: true, sanitized: urlObj.toString() };
  } catch {
    return { isValid: false, sanitized, error: 'URL inválida' };
  }
}

/**
 * Valida array de tags
 */
export function validateTags(tags: string[]): { isValid: boolean; sanitized: string[]; error?: string } {
  if (!Array.isArray(tags)) {
    return { isValid: false, sanitized: [], error: 'Tags inválidas' };
  }
  
  const sanitized = tags
    .map(tag => sanitizeText(tag, 50).trim())
    .filter(tag => tag.length > 0)
    .slice(0, 20); // Máximo 20 tags
  
  return { isValid: true, sanitized };
}

/**
 * Valida percentual (0-100)
 */
export function validatePercentage(value: string | number): { isValid: boolean; sanitized: number; error?: string } {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, sanitized: 0, error: 'Valor inválido' };
  }
  
  if (numValue < 0 || numValue > 100) {
    return { isValid: false, sanitized: 0, error: 'Valor deve estar entre 0 e 100' };
  }
  
  const sanitized = Math.round(numValue);
  
  return { isValid: true, sanitized };
}

/**
 * Previne SQL Injection escapando strings
 */
export function escapeSQLString(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\0')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Valida e sanitiza objeto completo
 */
export function validateFormData<T extends Record<string, any>>(
  data: T,
  validationRules: Record<keyof T, (value: any) => { isValid: boolean; sanitized?: any; error?: string }>
): { isValid: boolean; sanitized: Partial<T>; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const sanitized: Partial<T> = {};
  let isValid = true;
  
  for (const [field, validator] of Object.entries(validationRules)) {
    const result = validator(data[field]);
    
    if (!result.isValid) {
      isValid = false;
      errors[field] = result.error || 'Campo inválido';
    } else {
      sanitized[field as keyof T] = result.sanitized ?? data[field];
    }
  }
  
  return { isValid, sanitized, errors };
}