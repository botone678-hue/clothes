import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Public Supabase project URL. Vercel can override this with the same value,
// but the fallback ensures the client always targets the current project.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  'https://xlumcozbjdeluunvnriq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasKey: boolean;
}

export function getSupabaseStatus(): SupabaseConfigStatus {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl,
    hasKey: Boolean(supabaseAnonKey),
  };
}
