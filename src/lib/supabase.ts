import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbznqhsnukrzfohoqzhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiem5xaHNudWtyemZvaG9xemhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTgwMTUsImV4cCI6MjA5MjU3NDAxNX0.wWq3jjh4hzciQ9h5SwU60BVn3uo1Vv2KomXjaU4n878';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Some features may not work correctly.');
}

// Ensure we have a valid URL format to prevent "Invalid URL" errors
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder-project.supabase.co';

const validKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});