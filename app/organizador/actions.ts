"use server";

import { redirect } from "next/navigation";
import {
  clearOrganizerSession,
  createOrganizerSession,
  loadOrganizerMembership
} from "@/lib/organizer-auth";
import { getSupabasePublic } from "@/lib/supabase";

export type OrganizerLoginState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginOrganizer(
  _previousState: OrganizerLoginState,
  formData: FormData
): Promise<OrganizerLoginState> {
  const email = normalize(formData.get("email")).toLowerCase();
  const password = normalize(formData.get("password"));

  if (!email || !password) {
    return {
      ok: false,
      message: "Informe email e senha."
    };
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user || !data.session) {
    return {
      ok: false,
      message: "Email ou senha inválidos."
    };
  }

  const membership = await loadOrganizerMembership(data.user.id);
  const allowed =
    membership.links.length > 0 ||
    membership.roles.includes("organizer") ||
    membership.roles.includes("admin");

  if (!allowed) {
    return {
      ok: false,
      message: "Esta conta ainda não está vinculada a nenhum torneio."
    };
  }

  await createOrganizerSession({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in
  });

  redirect("/organizador");
}

export async function logoutOrganizer() {
  await clearOrganizerSession();
  redirect("/organizador/login");
}
