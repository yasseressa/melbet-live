import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "milbet_admin";
  cookies().set(cookieName, "", { path: "/", maxAge: 0 });

  const url = new URL(request.url);
  // go back to site root; middleware will redirect to default locale
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}
