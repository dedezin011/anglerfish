import { createClient } from "@supabase/supabase-js";

export type Lead = {
  nome: string;
  email: string;
};

export type SurveyResponse = {
  lead_id: string;
  modalidade: string;
  interesse_campeonato: string;
  valor_participacao: string;
  tipo_premio: string;
  interesse_ranking: string;
};

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
