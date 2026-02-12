import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SECURITY GUIDELINES FOR DATABASE PERSISTENCE:
 * 
 * 1. Row Level Security (RLS):
 *    Always enable RLS on all tables in the Supabase dashboard.
 *    Create policies that restrict access based on auth.uid().
 *    Example: CREATE POLICY "Users can only see their own maps" ON maps 
 *    FOR ALL USING (auth.uid() = user_id);
 * 
 * 2. Client-Side Verification:
 *    Always include the user's ID in queries as a secondary check.
 *    Example: supabase.from('maps').select('*').eq('user_id', currentUser.id);
 */