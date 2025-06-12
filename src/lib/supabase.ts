import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Funções utilitárias para o Team Manager
export const supabaseUtils = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from('usuarios').select('id').limit(1);
      return { success: !error, error: error?.message };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  // Safe query execution
  async safeQuery<T>(
    tableName: string,
    queryFn: (query: any) => any,
    fallbackData: T[] = []
  ): Promise<{ data: T[]; error: string | null }> {
    try {
      const query = supabase.from(tableName);
      const { data, error } = await queryFn(query);
      
      if (error) {
        console.warn(`[${tableName}] Query error:`, error);
        return { data: fallbackData, error: error.message };
      }

      return { data: data || fallbackData, error: null };
    } catch (err) {
      console.error(`[${tableName}] Unexpected error:`, err);
      return { data: fallbackData, error: (err as Error).message };
    }
  }
};