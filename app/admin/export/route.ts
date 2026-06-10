import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

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
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, nome, email, created_at, survey_responses(modalidade, interesse_campeonato, valor_participacao, tipo_premio, interesse_ranking, created_at)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "lead_id",
    "nome",
    "email",
    "lead_created_at",
    "modalidade",
    "interesse_campeonato",
    "valor_participacao",
    "tipo_premio",
    "interesse_ranking",
    "survey_created_at"
  ];

  const rows = (data ?? []).map((lead) => {
    const survey = Array.isArray(lead.survey_responses)
      ? lead.survey_responses[0]
      : lead.survey_responses;

    return [
      lead.id,
      lead.nome,
      lead.email,
      lead.created_at,
      survey?.modalidade,
      survey?.interesse_campeonato,
      survey?.valor_participacao,
      survey?.tipo_premio,
      survey?.interesse_ranking,
      survey?.created_at
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
