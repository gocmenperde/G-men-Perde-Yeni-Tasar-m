import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export const GET = handler;

export async function POST(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "Çok fazla giriş denemesi. Lütfen bekleyin." }, { status: 429 });
  }

  return handler(req, ctx as never);
}
