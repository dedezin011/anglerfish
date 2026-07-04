"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const coverBucket = "tournament-assets";
const maxCoverBytes = 5 * 1024 * 1024;
const allowedCoverTypes = ["image/jpeg", "image/png", "image/webp"];

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

function getCoverFile(formData: FormData) {
  const value = formData.get("cover_image");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function validateCoverFile(file: File | null) {
  if (!file) {
    return null;
  }

  if (!allowedCoverTypes.includes(file.type)) {
    return "A capa precisa ser JPG, PNG ou WebP.";
  }

  if (file.size > maxCoverBytes) {
    return "A capa precisa ter no máximo 5 MB.";
  }

  return null;
}

function getCoverExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function uploadCoverImage({
  file,
  tournamentId
}: {
  file: File;
  tournamentId: string;
}) {
  const supabase = getSupabaseAdmin();
  const extension = getCoverExtension(file);
  const path = `${tournamentId}/cover-${randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(coverBucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw error;
  }

  return path;
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
  const coverFile = getCoverFile(formData);
  const coverValidationError = validateCoverFile(coverFile);

  if (!name || !description || !prize || !slug || !code) {
    return {
      ok: false,
      message: "Preencha nome, slug, descrição, código e premiação."
    };
  }

  if (coverValidationError) {
    return {
      ok: false,
      message: coverValidationError
    };
  }

  if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    return {
      ok: false,
      message: "A data de término precisa ser depois da data de início."
    };
  }

  const supabase = getSupabaseAdmin();
  const tournamentId = randomUUID();
  let coverImagePath: string | null = null;

  const { data: existingTournament, error: existingError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message: existingError.message
    };
  }

  if (existingTournament) {
    return {
      ok: false,
      message: "Já existe um torneio com esse slug. Troque o identificador."
    };
  }

  if (coverFile) {
    try {
      coverImagePath = await uploadCoverImage({
        file: coverFile,
        tournamentId
      });
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a capa do torneio."
      };
    }
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .insert({
      id: tournamentId,
      name,
      slug,
      description,
      code,
      prize,
      starts_at: startsAt,
      ends_at: endsAt,
      status,
      rules,
      ...(coverImagePath ? { cover_image_path: coverImagePath } : {})
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
