import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET ??
  "";

export interface UserTokenData {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

/**
 * JWT cookie'den kullanıcı bilgilerini okur.
 * getServerSession() yerine kullanılır — NEXTAUTH_URL'den bağımsız çalışır.
 */
export async function getUserFromToken(req: NextRequest): Promise<UserTokenData | null> {
  try {
    const token = await getToken({ req, secret: JWT_SECRET });
    if (!token || !token.sub) return null;
    return {
      id: token.sub,
      email: (token.email as string) ?? "",
      name: token.name as string | null,
      role: ((token as any).role as string) ?? "USER",
    };
  } catch {
    return null;
  }
}
