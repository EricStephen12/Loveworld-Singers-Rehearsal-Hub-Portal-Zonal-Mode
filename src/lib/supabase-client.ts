// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Enable automatic session refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session in URL (for OAuth callbacks)
    detectSessionInUrl: true,
    // Storage key for session persistence
    storageKey: 'loveworld-singers-auth-token',
    // Storage implementation (defaults to localStorage)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Flow type for authentication
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'loveworld-singers-rehearsal-hub'
    }
  },
  db: {
    schema: 'public'
  },
  // Add retry logic for network errors
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

