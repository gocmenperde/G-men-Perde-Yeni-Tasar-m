import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    console.error("[ADDRESSES_GET]", error);
    return NextResponse.json({ error: "Adresler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const body = await req.json();
    const { title, fullName, phone, city, district, address, zipCode, isDefault } = body;

    if (!title || !fullName || !phone || !city || !district || !address)
      return NextResponse.json({ error: "Tüm zorunlu alanları doldurunuz." }, { status: 400 });

    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await db.address.create({
      data: {
        userId: user.id,
        title,
        fullName,
        phone,
        city,
        district,
        address,
        zipCode: zipCode ?? null,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json({ data: newAddress }, { status: 201 });
  } catch (error) {
    console.error("[ADDRESSES_POST]", error);
    return NextResponse.json({ error: "Adres kaydedilemedi." }, { status: 500 });
  }
}
