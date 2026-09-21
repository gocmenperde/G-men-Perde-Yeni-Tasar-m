import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET ??
  "";

const IS_DEV = process.env.NODE_ENV === "development";

async function isAdmin(req: NextRequest) {
  if (IS_DEV) return true;
  try {
    const token = await getToken({ req, secret: JWT_SECRET });
    return !!(token && (token as any).role === "ADMIN");
  } catch { return false; }
}

const MARKUPS = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 28, 30];

function pickMarkup(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return MARKUPS[Math.abs(h) % MARKUPS.length];
}

function nicePrice(raw: number): number {
  if (raw < 20)  return Math.round(raw * 2) / 2;
  if (raw < 50)  return Math.ceil(raw / 5) * 5 - 0.01;
  if (raw < 200) return Math.ceil(raw / 5) * 5 - 0.01;
  if (raw < 500) return Math.ceil(raw / 10) * 10 - 0.01;
  return Math.ceil(raw / 50) * 50 - 0.01;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req))
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const overwrite: boolean = body.overwrite ?? false;

    const products = await db.product.findMany({
      select: { id: true, price: true, comparePrice: true },
    });

    let updated = 0;
    let skipped = 0;

    for (const p of products) {
      if (!overwrite && p.comparePrice !== null) { skipped++; continue; }

      const price = Number(p.price);
      if (price <= 0) { skipped++; continue; }

      const pct = pickMarkup(p.id);
      const comparePrice = nicePrice(price * (1 + pct / 100));

      await db.product.update({
        where: { id: p.id },
        data: { comparePrice },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, updated, skipped, total: products.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Hata oluştu." }, { status: 500 });
  }
}
