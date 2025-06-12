// Debug Interceptador Total para Team Manager
// Baseado na versão do HelioGen - intercepta TODAS queries do Supabase
// Identifica fonte EXATA de erros 400 e problemas de query

import { supabase } from '@/lib/supabase';

interface QueryLog {
  id: number;
  timestamp: Date;
  table: string;
  operation: string;
  arguments: any[];
  success: boolean;
  error?: string;
  data?: any;
  stackTrace?: string;
}

class DebugInterceptor {
  private enabled = false;
  private queryCounter = 0;
  private logs: QueryLog[] = [];
  private maxLogs = 100;

  constructor() {
    // Auto-enable in development
    if (import.meta.env.DEV) {
      this.enable();
    }
  }

  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    console.log('🔍 [Debug Interceptor] ATIVADO - Monitorando queries do Supabase');
    
    this.interceptSupabaseClient();
  }

  disable() {
    this.enabled = false;
    console.log('🔍 [Debug Interceptor] DESATIVADO');
  }

  private interceptSupabaseClient() {
    // Intercept .from() method
    const originalFrom = supabase.from.bind(supabase);
    
    supabase.from = (table: string) => {
      const query = originalFrom(table);
      return this.wrapQuery(query, table);
    };

    // Intercept .rpc() method
    const originalRpc = supabase.rpc.bind(supabase);
    
    supabase.rpc = (fn: string, args?: any) => {
      const queryId = ++this.queryCounter;
      
      console.log(`🔍 [${queryId}] RPC INICIADA - Função: ${fn}`, args);
      
      const promise = originalRpc(fn, args);
      
      return promise.then(
        (result) => {
          console.log(`✅ [${queryId}] RPC SUCESSO - Função: ${fn}`, result);
          this.logQuery(queryId, 'RPC', fn, [args], true, undefined, result.data);
          return result;
        },
        (error) => {
          console.error(`❌ [${queryId}] RPC ERRO - Função: ${fn}`, error);
          this.logQuery(queryId, 'RPC', fn, [args], false, error.message);
          throw error;
        }
      );
    };
  }

  private wrapQuery(query: any, table: string): any {
    const queryId = ++this.queryCounter;
    
    // Intercept common query methods
    const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
    
    methods.forEach(method => {
      if (query[method]) {
        const originalMethod = query[method].bind(query);
        
        query[method] = (...args: any[]) => {
          console.log(`🔍 [${queryId}] QUERY INICIADA - Tabela: ${table}, Método: ${method}`, args);
          
          const result = originalMethod(...args);
          
          // Se for o último método da chain (tem .then), interceptar
          if (result && typeof result.then === 'function') {
            return result.then(
              (response: any) => {
                console.log(`✅ [${queryId}] SUCESSO - Tabela: ${table}, Registros: ${response.data?.length || 0}`, response);
                this.logQuery(queryId, method.toUpperCase(), table, args, true, undefined, response.data);
                return response;
              },
              (error: any) => {
                console.error(`❌ [${queryId}] ERRO 400 ENCONTRADO! Tabela: ${table}`, error);
                this.logQuery(queryId, method.toUpperCase(), table, args, false, error.message);
                
                // Log stack trace para debug
                if (error.message?.includes('400')) {
                  console.error(`🚨 [${queryId}] STACK TRACE:`, new Error().stack);
                }
                
                throw error;
              }
            );
          }
          
          return result;
        };
      }
    });

    return query;
  }

  private logQuery(
    id: number,
    operation: string,
    table: string,
    args: any[],
    success: boolean,
    error?: string,
    data?: any
  ) {
    const log: QueryLog = {
      id,
      timestamp: new Date(),
      table,
      operation,
      arguments: args,
      success,
      error,
      data,
      stackTrace: success ? undefined : new Error().stack
    };

    this.logs.push(log);
    
    // Maintain max logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  // Get all logs
  getLogs(): QueryLog[] {
    return [...this.logs];
  }

  // Get error logs only
  getErrorLogs(): QueryLog[] {
    return this.logs.filter(log => !log.success);
  }

  // Get logs for specific table
  getLogsForTable(table: string): QueryLog[] {
    return this.logs.filter(log => log.table === table);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.log('🔍 [Debug Interceptor] Logs limpos');
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Print summary
  printSummary() {
    const total = this.logs.length;
    const errors = this.getErrorLogs().length;
    const success = total - errors;
    
    console.log(`
📊 [Debug Interceptor] RESUMO:
   Total de queries: ${total}
   Sucessos: ${success}
   Erros: ${errors}
   Taxa de sucesso: ${total > 0 ? ((success / total) * 100).toFixed(1) : 0}%
    `);

    if (errors > 0) {
      console.log('❌ Queries com erro:');
      this.getErrorLogs().forEach(log => {
        console.log(`   [${log.id}] ${log.operation} ${log.table}: ${log.error}`);
      });
    }
  }
}

// Global instance
const debugInterceptor = new DebugInterceptor();

// Export for manual control
export { debugInterceptor };

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).debugInterceptor = debugInterceptor;
  console.log('🔍 Debug Interceptor disponível globalmente: window.debugInterceptor');
}