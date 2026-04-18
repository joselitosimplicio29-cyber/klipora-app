// Cliente Supabase — conexão com o banco de dados do Klipora
import { createClient } from '@supabase/supabase-js';

// Pega as credenciais do arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (usa Service Role Key — só no backend, nunca no frontend)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)