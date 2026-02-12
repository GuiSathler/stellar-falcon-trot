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