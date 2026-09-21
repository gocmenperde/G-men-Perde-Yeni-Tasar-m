import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length < 2)
      return NextResponse.json({ error: "Ad Soyad en az 2 karakter olmalıdır." }, { status: 400 });

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[USERS_ME_PATCH]", error);
    return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
  }
}
