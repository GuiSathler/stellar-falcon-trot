import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please check your .env file.');
}

// We use empty strings as defaults to prevent the app from crashing during initialization
// while ensuring it fails safely rather than sending requests to a placeholder domain.
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);