import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: coupons });
  } catch {
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const body = await req.json();
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = body;
    if (!code || !type || !value)
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    const existing = await db.coupon.findFirst({
      where: { code: code.toUpperCase() },
    });
    if (existing)
      return NextResponse.json(
        { error: "Bu kupon kodu zaten kullanımda." },
        { status: 409 },
      );
    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minOrderAmount: minOrderAmount ?? 0,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kupon oluşturulamadı." },
      { status: 500 },
    );
  }
}
