import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// We provide fallback values to prevent the app from crashing during setup,
// but we log a warning so the user knows why auth/database features won't work yet.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please click the "Add Supabase" button to connect your project.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * SECURITY GUIDELINES FOR DATABASE PERSISTENCE:
 * 
 * 1. Row Level Security (RLS):
 *    Always enable RLS on all tables in the Supabase dashboard.
 *    Create policies that restrict access based on auth.uid().
 * 
 * 2. Client-Side Verification:
 *    Always include the user's ID in queries as a secondary check.
 */