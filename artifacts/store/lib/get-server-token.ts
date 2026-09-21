import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET ??
  "";

export interface ServerTokenData {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

/**
 * Server component ve layout'larda JWT cookie'yi doğrudan okur.
 * Hem HTTPS (__Secure- prefix) hem HTTP cookie adını dener.
 * decode() kullanır — NEXTAUTH_URL bağımsız, Vercel/custom domain uyumlu.
 */
export async function getServerToken(): Promise<ServerTokenData | null> {
  try {
    const cookieStore = await cookies();

    // HTTPS (Vercel/production) → __Secure- prefix kullanır
    // HTTP (local dev) → prefix olmadan kullanır
    const rawToken =
      cookieStore.get("__Secure-next-auth.session-token")?.value ??
      cookieStore.get("next-auth.session-token")?.value;

    if (!rawToken) return null;

    const token = await decode({ token: rawToken, secret: JWT_SECRET });

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

export function isAdmin(token: ServerTokenData | null): boolean {
  return token?.role === "ADMIN";
}
