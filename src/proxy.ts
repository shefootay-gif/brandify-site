import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { defaultLocale, isLocale } from "@/lib/i18n";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin: optimistic redirect when there's no session cookie. Real
  // authorization happens server-side in every admin page and action.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!getSessionCookie(request)) {
      const url = new URL("/admin/login", request.url);
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  // No locale prefix → redirect to the remembered (or default) language.
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(remembered) ? remembered : defaultLocale;
  const url = new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
  return NextResponse.redirect(url, pathname === "/" ? 307 : 308);
}

export const config = {
  // Skip Next internals, API routes, uploaded media and files with extensions.
  matcher: ["/((?!_next|api|media|brand|.*\\..*).*)"],
};
