import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve config from Vite environment variables, Next.js variables, or localStorage override
export function getSupabaseCredentials(): { supabaseUrl: string; supabaseAnonKey: string } {
  const envUrl = 
    import.meta.env.VITE_SUPABASE_URL || 
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
    '';
    
  const envKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';

  // Check localStorage for quick testing if env vars were not populated during build
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('VOYX_SUPABASE_URL') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('VOYX_SUPABASE_ANON_KEY') || '' : '';

  return {
    supabaseUrl: (storedUrl || envUrl).trim(),
    supabaseAnonKey: (storedKey || envKey).trim(),
  };
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfig = { url: '', key: '' };

export function getSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Reuse instance if config hasn't changed
  if (supabaseInstance && currentConfig.url === supabaseUrl && currentConfig.key === supabaseAnonKey) {
    return supabaseInstance;
  }

  currentConfig = { url: supabaseUrl, key: supabaseAnonKey };
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

export function saveRuntimeCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VOYX_SUPABASE_URL', url.trim());
    localStorage.setItem('VOYX_SUPABASE_ANON_KEY', key.trim());
    supabaseInstance = null; // reset to re-instantiate
  }
}

export function clearRuntimeCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VOYX_SUPABASE_URL');
    localStorage.removeItem('VOYX_SUPABASE_ANON_KEY');
    supabaseInstance = null;
  }
}
