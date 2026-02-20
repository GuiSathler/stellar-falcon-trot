import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para ajudar no diagnóstico (não exibe a chave completa por segurança)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase: Variáveis de ambiente não encontradas. Verifique a integração.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;