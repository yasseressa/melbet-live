"use server";

import { cookies } from "next/headers";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD || "change-me-please";
  const cookieName = process.env.ADMIN_COOKIE_NAME || "milbet_admin";

  if (password && password === expected) {
    cookies().set(cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return { ok: true };
  }
  return { ok: false };
}
