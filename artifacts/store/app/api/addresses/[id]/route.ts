import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });
    const { id } = await params;

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id)
      return NextResponse.json({ error: "Adres bulunamadı." }, { status: 404 });

    const body = await req.json();
    const { title, fullName, phone, city, district, address, zipCode, isDefault } = body;

    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(district && { district }),
        ...(address && { address }),
        zipCode: zipCode ?? null,
        ...(typeof isDefault === "boolean" && { isDefault }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[ADDRESS_PUT]", error);
    return NextResponse.json({ error: "Adres güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });
    const { id } = await params;

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id)
      return NextResponse.json({ error: "Adres bulunamadı." }, { status: 404 });

    await db.address.delete({ where: { id } });

    if (existing.isDefault) {
      const next = await db.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADDRESS_DELETE]", error);
    return NextResponse.json({ error: "Adres silinemedi." }, { status: 500 });
  }
}
