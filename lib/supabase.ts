'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please check your configuration.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'fallback-url-for-build',
  supabaseAnonKey || 'fallback-key-for-build',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-client-info': 'voting-system',
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: undefined // Remove timeout signal
        });
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  }
); 