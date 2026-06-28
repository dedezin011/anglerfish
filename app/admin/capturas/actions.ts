"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type ReviewStatus = "pending" | "approved" | "rejected";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isReviewStatus(value: string): value is ReviewStatus {
  return ["pending", "approved", "rejected"].includes(value);
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/admin/capturas") ? value : "/admin/capturas";
}

export async function updateCaptureReview(formData: FormData) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const id = getString(formData, "id");
  const status = getString(formData, "status");
  const reviewerNotes = getString(formData, "reviewer_notes");
  const redirectTo = getSafeRedirectPath(getString(formData, "redirect_to"));

  if (!id || !isReviewStatus(status)) {
    throw new Error("Dados de análise inválidos.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("catch_submissions")
    .update({
      status,
      reviewer_notes: reviewerNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/capturas");
  redirect(redirectTo);
}
