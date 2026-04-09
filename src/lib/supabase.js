import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://aogkjtkylsjuybushnwz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2tqdGt5bHNqdXlidXNobnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA5NjcsImV4cCI6MjA5MTI5Njk2N30.PZNOUUsDxWrZIwvE84EsWRFfGvDTxc1WLs1uhvqtdic";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
