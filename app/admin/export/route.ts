import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type LeadRow = {
  id: string;
  nome: string;
  email: string;
  created_at: string;
};

type SurveyRow = {
  id: string;
  lead_id: string | null;
  is_anonymous: boolean;
  modalidade: string[];
  interesse_campeonato: string;
  valor_participacao: string[];
  tipo_premio: string[];
  interesse_ranking: string;
  sugestao_plataforma: string | null;
  created_at: string;
};

function escapeCsv(value: unknown) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const [{ data: leadsData, error: leadsError }, { data: surveyData, error: surveyError }] =
    await Promise.all([
      supabase.from("leads").select("id, nome, email, created_at"),
      supabase
        .from("survey_responses")
        .select(
          "id, lead_id, is_anonymous, modalidade, interesse_campeonato, valor_participacao, tipo_premio, interesse_ranking, sugestao_plataforma, created_at"
        )
        .order("created_at", { ascending: false })
    ]);

  if (leadsError || surveyError) {
    return NextResponse.json(
      { error: leadsError?.message ?? surveyError?.message },
      { status: 500 }
    );
  }

  const leads = new Map(
    ((leadsData ?? []) as LeadRow[]).map((lead) => [lead.id, lead])
  );

  const headers = [
    "survey_id",
    "lead_id",
    "is_anonymous",
    "nome",
    "email",
    "lead_created_at",
    "modalidade",
    "interesse_campeonato",
    "valor_participacao",
    "tipo_premio",
    "interesse_ranking",
    "sugestao_plataforma",
    "survey_created_at"
  ];

  const rows = ((surveyData ?? []) as SurveyRow[]).map((survey) => {
    const lead = survey.lead_id ? leads.get(survey.lead_id) : undefined;

    return [
      survey.id,
      survey.lead_id,
      survey.is_anonymous,
      lead?.nome,
      lead?.email,
      lead?.created_at,
      survey.modalidade,
      survey.interesse_campeonato,
      survey.valor_participacao,
      survey.tipo_premio,
      survey.interesse_ranking,
      survey.sugestao_plataforma,
      survey.created_at
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anglerfish-leads.csv"'
    }
  });
}
