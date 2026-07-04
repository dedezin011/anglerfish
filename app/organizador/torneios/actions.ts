"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CreateTournamentState = {
  ok: boolean;
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

function parseRules(value: string) {
  const rules = value
    .split(/\r?\n/)
    .map((rule) => rule.trim())
    .filter(Boolean)
    .slice(0, 12);

  return rules.length
    ? rules
    : [
        "Envie uma foto do peixe na régua.",
        "Envie um vídeo curto falando o código do torneio.",
        "Informe espécie, medida, cidade, estado e modalidade.",
        "Capturas ficam em análise antes de entrar no ranking."
      ];
}

function parseBrazilDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}:00-03:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export async function createOrganizerTournament(
  _previousState: CreateTournamentState,
  formData: FormData
): Promise<CreateTournamentState> {
  const session = await getOrganizerSession();

  if (!session) {
    redirect("/organizador/login");
  }

  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const prize = getString(formData, "prize");
  const slug = slugify(getString(formData, "slug") || name);
  const code = normalizeCode(getString(formData, "code"));
  const statusValue = getString(formData, "status");
  const status = statusValue === "draft" ? "draft" : "active";
  const startsAt = parseBrazilDateTime(getString(formData, "starts_at"));
  const endsAt = parseBrazilDateTime(getString(formData, "ends_at"));
  const rules = parseRules(getString(formData, "rules"));

  if (!name || !description || !prize || !slug || !code) {
    return {
      ok: false,
      message: "Preencha nome, slug, descrição, código e premiação."
    };
  }

  if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    return {
      ok: false,
      message: "A data de término precisa ser depois da data de início."
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .insert({
      name,
      slug,
      description,
      code,
      prize,
      starts_at: startsAt,
      ends_at: endsAt,
      status,
      rules
    })
    .select("id")
    .single();

  if (tournamentError || !tournament) {
    return {
      ok: false,
      message:
        tournamentError?.code === "23505"
          ? "Já existe um torneio com esse slug. Troque o identificador."
          : tournamentError?.message ?? "Não foi possível criar o torneio."
    };
  }

  const { error: organizerError } = await supabase.from("tournament_organizers").insert({
    tournament_id: tournament.id,
    user_id: session.user.id,
    role: "owner"
  });

  if (organizerError) {
    return {
      ok: false,
      message:
        "O torneio foi criado, mas não foi possível vincular o organizador automaticamente."
    };
  }

  revalidatePath("/organizador");
  revalidatePath("/organizador/capturas");
  redirect(`/organizador/capturas?tournament=${tournament.id}&status=pending`);
}
