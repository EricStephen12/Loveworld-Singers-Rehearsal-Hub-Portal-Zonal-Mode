// Supabase Client for LoveWorld Singers App
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
 console.warn('⚠️ Missing Supabase environment variables! Creating a mock client since Supabase is being deprecated.');
}

// Create a mock client if URL is missing to prevent 'supabaseUrl is required' errors
export const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : new Proxy({}, {
        get: () => {
            return () => new Promise(resolve => resolve({ data: null, error: { message: 'Supabase is deprecated' } }));
        }
    }) as any;

export default supabase;
