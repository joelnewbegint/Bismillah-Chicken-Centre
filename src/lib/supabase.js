import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://aogkjtkylsjuybushnwz.supabase.co";
const fallbackAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2tqdGt5bHNqdXlidXNobnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA5NjcsImV4cCI6MjA5MTI5Njk2N30.PZNOUUsDxWrZIwvE84EsWRFfGvDTxc1WLs1uhvqtdic";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

export const isSupabaseUsingFallbackConfig =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isSupabaseUsingFallbackConfig) {
  // Avoid blank-screen crashes in local/dev when .env is missing.
  console.warn("Using fallback Supabase config. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
