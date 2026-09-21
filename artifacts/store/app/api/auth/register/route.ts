import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function isPrismaUnavailableError(error: unknown) {
  return error instanceof Error && error.message.includes("Prisma client is unavailable");
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  try {
    const payload = await req.json();
    const name = String(payload?.name ?? "").trim();
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const password = String(payload?.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { name, email, password: hashed, role: "USER" } });

    return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("[AUTH_REGISTER]", error);
    if (isPrismaUnavailableError(error)) {
      return NextResponse.json({ error: "Sunucu veritabanı istemcisi hazır değil. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: process.env.NODE_ENV === "development" ? message : "Sunucu hatası" }, { status: 500 });
  }
}
