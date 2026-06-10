"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  validateAdminCredentials
} from "@/lib/admin-auth";

export type AdminLoginState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = normalize(formData.get("email")).toLowerCase();
  const password = normalize(formData.get("password"));

  if (!validateAdminCredentials(email, password)) {
    return {
      ok: false,
      message: "Email ou senha inválidos."
    };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
