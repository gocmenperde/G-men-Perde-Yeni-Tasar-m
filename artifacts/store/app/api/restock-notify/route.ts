import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { productId, email } = await req.json();

    if (!productId || !email) {
      return NextResponse.json({ error: "productId ve email zorunludur." }, { status: 400 });
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta adresi." }, { status: 400 });
    }

    const existing = await (db as any).restockNotification.findFirst({
      where: { productId, email, notifiedAt: null },
    });

    if (existing) {
      return NextResponse.json({ message: "Zaten kayıtlısınız." });
    }

    await (db as any).restockNotification.create({
      data: { productId, email },
    });

    return NextResponse.json({ message: "Kaydedildi. Ürün stoğa girince haber vereceğiz!" });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
