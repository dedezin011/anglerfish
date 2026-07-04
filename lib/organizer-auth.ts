import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

const accessCookieName = "anglerfish_organizer_access";
const refreshCookieName = "anglerfish_organizer_refresh";

export type OrganizerLink = {
  tournament_id: string;
  role: "owner" | "manager" | "reviewer";
};

export type OrganizerSession = {
  user: User;
  accessToken: string;
  links: OrganizerLink[];
  roles: string[];
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/organizador",
    maxAge
  };
}

export async function createOrganizerSession({
  accessToken,
  refreshToken,
  expiresIn
}: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  const cookieStore = await cookies();

  cookieStore.set(
    accessCookieName,
    accessToken,
    cookieOptions(Math.max(expiresIn ?? 60 * 60, 60))
  );

  if (refreshToken) {
    cookieStore.set(refreshCookieName, refreshToken, cookieOptions(60 * 60 * 24 * 30));
  }
}

export async function clearOrganizerSession() {
  const cookieStore = await cookies();

  cookieStore.set(accessCookieName, "", cookieOptions(0));
  cookieStore.set(refreshCookieName, "", cookieOptions(0));
}

export async function loadOrganizerMembership(userId: string) {
  const supabase = getSupabaseAdmin();

  const [{ data: rolesData, error: rolesError }, { data: linksData, error: linksError }] =
    await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("tournament_organizers")
        .select("tournament_id, role")
        .eq("user_id", userId)
    ]);

  if (rolesError || linksError) {
    throw rolesError ?? linksError;
  }

  return {
    roles: ((rolesData ?? []) as { role: string }[]).map((row) => row.role),
    links: (linksData ?? []) as OrganizerLink[]
  };
}

export async function getOrganizerSession(): Promise<OrganizerSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessCookieName)?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  const membership = await loadOrganizerMembership(data.user.id);
  const allowed =
    membership.links.length > 0 ||
    membership.roles.includes("organizer") ||
    membership.roles.includes("admin");

  if (!allowed) {
    return null;
  }

  return {
    user: data.user,
    accessToken,
    links: membership.links,
    roles: membership.roles
  };
}
