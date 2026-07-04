"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { getSupabaseUser } from "@/lib/supabase";

type ReviewStatus = "pending" | "approved" | "rejected";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isReviewStatus(value: string): value is ReviewStatus {
  return ["pending", "approved", "rejected"].includes(value);
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/organizador/capturas") ? value : "/organizador/capturas";
}

export async function updateOrganizerCaptureReview(formData: FormData) {
  const session = await getOrganizerSession();

  if (!session) {
    redirect("/organizador/login");
  }

  const id = getString(formData, "id");
  const status = getString(formData, "status");
  const reviewerNotes = getString(formData, "reviewer_notes");
  const redirectTo = getSafeRedirectPath(getString(formData, "redirect_to"));

  if (!id || !isReviewStatus(status)) {
    throw new Error("Dados de análise inválidos.");
  }

  const supabase = getSupabaseUser(session.accessToken);
  const { error } = await supabase.rpc("review_tournament_submission", {
    submission_id: id,
    new_status: status,
    notes: reviewerNotes || null
  });

  if (error) {
    throw error;
  }

  revalidatePath("/organizador");
  revalidatePath("/organizador/capturas");
  redirect(redirectTo);
}
