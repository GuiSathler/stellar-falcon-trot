import { supabase as officialClient } from "@/integrations/supabase/client";

export const supabase = officialClient;

// Como as chaves estão hardcoded no cliente oficial para este ambiente, 
// sempre consideramos configurado.
export const isSupabaseConfigured = true;