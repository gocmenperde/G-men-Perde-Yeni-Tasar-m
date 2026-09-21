import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });
    const { id } = await params;
    const { rating, comment } = await req.json();
    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: "Geçersiz puan." }, { status: 400 });
    const existing = await db.review.findFirst({
      where: { userId: user.id, productId: id },
    });
    if (existing)
      return NextResponse.json(
        { error: "Bu ürün için zaten yorum yaptınız." },
        { status: 409 },
      );
    const review = await db.review.create({
      data: { userId: user.id, productId: id, rating, comment },
    });
    return NextResponse.json({ data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Yorum eklenemedi." }, { status: 500 });
  }
}
