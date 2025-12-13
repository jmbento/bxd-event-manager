import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Chaves fixas do Supabase (projeto hzgzobcjdgddtrfzbywg)
const supabaseUrl = 'https://hzgzobcjdgddtrfzbywg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzgxNDIsImV4cCI6MjA4MDQxNDE0Mn0.wopx2seFG3w4-noREXf6TYuLRkMOZmsNK75-cXwmWk8';

client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

export const supabase = client;
export const hasSupabase = Boolean(client);
