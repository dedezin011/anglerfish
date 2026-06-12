"use server";

import {
  getSupabaseAdmin,
  type Lead,
  type SurveyResponse
} from "@/lib/supabase";

export type WaitlistState = {
  ok: boolean;
  message: string;
  leadId?: string;
  showSurvey?: boolean;
};

export type SurveyState = {
  ok: boolean;
  message: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMany(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function joinWaitlist(
  _previousState: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const lead: Lead = {
    nome: normalize(formData.get("nome")),
    email: normalize(formData.get("email")).toLowerCase()
  };

  if (!lead.nome || !lead.email) {
    return {
      ok: false,
      message: "Preencha seu nome e email para entrar na lista de espera."
    };
  }

  if (!emailRegex.test(lead.email)) {
    return {
      ok: false,
      message: "Informe um email válido."
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .insert(lead)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: existingLead, error: existingLeadError } = await supabase
          .from("leads")
          .select("id")
          .eq("email", lead.email)
          .single();

        if (existingLeadError || !existingLead) {
          throw existingLeadError ?? error;
        }

        return {
          ok: true,
          leadId: existingLead.id,
          showSurvey: true,
          message:
            "Você já está na lista de espera. Responda a pesquisa rápida para nos ajudar."
        };
      }

      throw error;
    }

    return {
      ok: true,
      leadId: data.id,
      showSurvey: true,
      message: "Cadastro recebido. Você entrou na lista de espera do AnglerFish."
    };
  } catch (error) {
    console.error("Waitlist insert failed", error);

    return {
      ok: false,
      message:
        "Não foi possível salvar agora. Verifique a configuração do Supabase e tente novamente."
    };
  }
}

export async function submitSurvey(
  _previousState: SurveyState,
  formData: FormData
): Promise<SurveyState> {
  const isAnonymous = normalize(formData.get("is_anonymous")) === "true";
  const leadId = normalize(formData.get("lead_id"));
  const response: SurveyResponse = {
    lead_id: isAnonymous ? null : leadId,
    is_anonymous: isAnonymous,
    modalidade: normalizeMany(formData, "modalidade"),
    interesse_campeonato: normalize(formData.get("interesse_campeonato")),
    valor_participacao: normalizeMany(formData, "valor_participacao"),
    tipo_premio: normalizeMany(formData, "tipo_premio"),
    interesse_ranking: normalize(formData.get("interesse_ranking"))
  };

  const hasMissingField =
    (!response.is_anonymous && !response.lead_id) ||
    !response.interesse_campeonato ||
    !response.interesse_ranking ||
    response.modalidade.length === 0 ||
    response.valor_participacao.length === 0 ||
    response.tipo_premio.length === 0;

  if (hasMissingField) {
    return {
      ok: false,
      message: "Responda as 5 perguntas para concluir a pesquisa."
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = response.is_anonymous
      ? await supabase.from("survey_responses").insert(response)
      : await supabase
          .from("survey_responses")
          .upsert(response, { onConflict: "lead_id" });

    if (error) {
      throw error;
    }

    return {
      ok: true,
      message:
        "Pesquisa enviada. Obrigado por ajudar a construir a melhor plataforma de pesca do Brasil."
    };
  } catch (error) {
    console.error("Survey insert failed", error);

    return {
      ok: false,
      message:
        "Não foi possível salvar a pesquisa agora. Tente novamente em alguns instantes."
    };
  }
}
