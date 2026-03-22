import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ktzhrlcvluaptixngrsh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0emhybGN2bHVhcHRpeG5ncnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDY1MjAsImV4cCI6MjA4MjcyMjUyMH0.ErPVbPk8kg6HPgWI15L3ghWKNALzYCxYMr-Eh5J9bRU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
