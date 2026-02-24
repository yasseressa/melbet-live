import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["ar", "en"] as const;
const ADMIN_COOKIE = process.env.ADMIN_COOKIE_NAME || "milbet_admin";

function hasLocale(pathname: string) {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function isPublicFile(pathname: string) {
  return /\.[^/]+$/.test(pathname);
}

function isAdminLogin(pathname: string) {
  return /^\/(ar|en)\/admin\/login\/?$/.test(pathname);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never rewrite static/public files (e.g. /brand/melbet-logo.png)
  if (isPublicFile(pathname)) {
    return NextResponse.next();
  }

  // Redirect root to default locale
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "ar"}`;
    return NextResponse.redirect(url);
  }

  // If missing locale, prefix with default
  if (!hasLocale(pathname) && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    const url = req.nextUrl.clone();
    url.pathname = `/${process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "ar"}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Admin guard: allow login page, protect the rest with cookie.
  if (hasLocale(pathname) && pathname.includes("/admin") && !isAdminLogin(pathname)) {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace(/\/(ar|en)\/admin.*/, "/$1/admin/login");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
