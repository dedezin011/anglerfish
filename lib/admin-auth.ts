import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

const cookieName = "anglerfish_admin_session";

function safeCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function validateAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return false;
  }

  return (
    safeCompare(email, adminEmail.toLowerCase()) &&
    safeCompare(password, adminPassword)
  );
}

export async function createAdminSession() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieName, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0
  });
}

export async function isAdminAuthenticated() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;

  return Boolean(session && safeCompare(session, sessionSecret));
}
