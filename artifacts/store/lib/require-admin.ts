import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET ??
  "";

/**
 * getToken() kullanır — NEXTAUTH_URL'den bağımsız çalışır.
 * getServerSession() production'da custom domain'de NEXTAUTH_URL yanlışsa
 * null döndürebilir; bu helper o sorunu ortadan kaldırır.
 */
export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  try {
    const token = await getToken({ req, secret: JWT_SECRET });
    return !!(token && (token as any).role === "ADMIN");
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
}
