import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isto avisa-te logo no arranque se te esqueceste do .env.local
  console.error(
    "Faltam as variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example para .env.local e preenche."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
