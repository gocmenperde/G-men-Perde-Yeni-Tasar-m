import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Eski filtreli ürün URL'lerini gerçek SEO rotalarına taşı. Bu redirect'i
  // next.config yerine burada yapıyoruz; Next config kaynak query string'ini
  // hedefe otomatik eklediği için /kategori/slug?category=slug üretiyordu.
  if (pathname === "/products") {
    const category = request.nextUrl.searchParams.get("category");
    const brand = request.nextUrl.searchParams.get("brand");
    const slug = category || brand;
    if (slug) {
      const target = request.nextUrl.clone();
      target.pathname = `${category ? "/kategori" : "/marka"}/${encodeURIComponent(slug)}`;
      target.search = "";
      return NextResponse.redirect(target, 308);
    }
  }

  const requiresAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders");

  if (!requiresAuth) return NextResponse.next();

  const secret =
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.SECRET;

  const token = await getToken({
    req: request,
    secret,
    // Vercel TLS'i origin'den önce sonlandırabilir; request URL'si HTTP
    // görünse bile production cookie'si __Secure- prefix'i taşır.
    secureCookie:
      process.env.NODE_ENV === "production" ||
      process.env.NEXTAUTH_URL?.startsWith("https://") === true,
  });

  // ── Admin koruması ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token || (token as any).role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-giris";
      return NextResponse.redirect(url);
    }
  }

  // API çağrıları redirect almamalı; crawler veya doğrudan internet trafiği
  // admin endpoint'lerinin pahalı iş mantığına ulaşmadan 401 almalı.
  if (pathname.startsWith("/api/admin") && (!token || (token as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  // ── Giriş gerektiren sayfalar ─────────────────────────────────────────────
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders")
  ) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Public catalog, SEO pages and static assets do not need a token lookup.
  // Keeping them out of middleware avoids an Edge invocation on every public
  // page and prevents auth middleware from rewriting cache headers on RSC
  // responses.
  matcher: [
    "/products",
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
};
