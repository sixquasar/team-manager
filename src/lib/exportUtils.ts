import { formatCurrency } from './formatUtils';
import { formatDateSafe } from '@/utils/formatUtils';

interface Invoice {
  id: string;
  customer: string;
  project: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt?: string;
}

interface Expense {
  id: string;
  description: string;
  supplier: string;
  category: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt?: string;
}

// Função para exportar dados para CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('Sem dados para exportar');
    return;
  }

  // Obter cabeçalhos das colunas
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  
  // Criar conteúdo CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar vírgulas e aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formatDateSafe(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para exportar faturas
export const exportInvoices = (invoices: Invoice[], format: 'csv' | 'pdf' = 'csv') => {
  if (format === 'csv') {
    const dataToExport = invoices.map(invoice => ({
      'ID': invoice.id,
      'Cliente': invoice.customer,
      'Projeto': invoice.project,
      'Valor': formatCurrency(invoice.amount),
      'Vencimento': formatDateSafe(invoice.dueDate),
      'Status': invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Vencido',
      'Criado em': invoice.createdAt ? formatDateSafe(invoice.createdAt) : ''
    }));
    
    exportToCSV(dataToExport, 'faturas');
  } else {
    // TODO: Implementar exportação PDF
    console.log('Exportação PDF ainda não implementada');
  }
};

// Função para exportar despesas
export const exportExpenses = (expenses: Expense[], format: 'csv' | 'pdf' = 'csv') => {
  if (format === 'csv') {
    const dataToExport = expenses.map(expense => ({
      'ID': expense.id,
      'Descrição': expense.description,
      'Fornecedor': expense.supplier,
      'Categoria': expense.category,
      'Valor': formatCurrency(expense.amount),
      'Vencimento': formatDateSafe(expense.dueDate),
      'Status': expense.status === 'paid' ? 'Pago' : expense.status === 'pending' ? 'Pendente' : 'Vencido',
      'Criado em': expense.createdAt ? formatDateSafe(expense.createdAt) : ''
    }));
    
    exportToCSV(dataToExport, 'despesas');
  } else {
    // TODO: Implementar exportação PDF
    console.log('Exportação PDF ainda não implementada');
  }
};

// Função para gerar relatório financeiro
export const generateFinancialReport = (data: {
  invoices: Invoice[];
  expenses: Expense[];
  period: { from: Date; to: Date };
}) => {
  const { invoices, expenses, period } = data;
  
  // Calcular totais
  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
    
  const totalPending = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);
    
  const totalExpenses = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const profit = totalRevenue - totalExpenses;
  
  // Criar conteúdo do relatório
  const reportData = {
    'Período': `${formatDateSafe(period.from)} a ${formatDateSafe(period.to)}`,
    'Receita Total': formatCurrency(totalRevenue),
    'Contas a Receber': formatCurrency(totalPending),
    'Despesas Totais': formatCurrency(totalExpenses),
    'Lucro': formatCurrency(profit),
    'Margem de Lucro': `${((profit / totalRevenue) * 100).toFixed(2)}%`,
    'Número de Faturas': invoices.length,
    'Número de Despesas': expenses.length
  };
  
  // Exportar como CSV
  const csvContent = Object.entries(reportData)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');
    
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_financeiro_${formatDateSafe(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para exportar dados do dashboard
export const exportDashboardData = (data: any, filename: string = 'dashboard_data') => {
  // Formatar dados para exportação
  const formattedData = Array.isArray(data) ? data : [data];
  exportToCSV(formattedData, filename);
};