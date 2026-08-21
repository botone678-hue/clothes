import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The Supabase project URL is public client configuration. Keep the Vercel
// variable supported, but provide the project's known URL as a build-safe
// fallback so authentication does not incorrectly appear unconfigured when
// Vercel fails to inject VITE_SUPABASE_URL into a Vite production build.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  'https://loznvcpwopvgnzmycntl.supabase.co';
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
