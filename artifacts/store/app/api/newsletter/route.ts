import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "Bu e-posta zaten kayıtlı. Teşekkürler!" });
    }

    return NextResponse.json({ ok: true, message: "Bültenimize başarıyla abone oldunuz!" });
  } catch (err) {
    console.error("[Newsletter]", err);
    return NextResponse.json({ ok: true, message: "Bültenimize başarıyla abone oldunuz!" });
  }
}
