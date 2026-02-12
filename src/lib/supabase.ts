import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We use placeholder values if environment variables are missing to prevent the app 
// from crashing during initialization. This allows the UI to render so you can 
// see the setup instructions or use non-database features.
const placeholderUrl = 'https://your-project.supabase.co';
const placeholderKey = 'your-anon-key';

export const supabase = createClient(
  supabaseUrl || placeholderUrl,
  supabaseAnonKey || placeholderKey
);