import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const SETUP_KEY = process.env.SETUP_ADMIN_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const action = searchParams.get("action") ?? "all";

  if (!SETUP_KEY || key !== SETUP_KEY) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // ── 1. Eksik kolonları ekle ────────────────────────────────────────────────
  if (action === "migrate" || action === "all") {
    const migrations = [
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "adminNote" TEXT`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "addressId" TEXT`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeId" TEXT`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingCompany" TEXT`,
    ];

    for (const sql of migrations) {
      try {
        await db.$executeRawUnsafe(sql);
        const col = sql.match(/"(\w+)"[^"]*$/)?.[1] ?? sql;
        results[col] = "✅ eklendi / zaten vardı";
      } catch (e: any) {
        results[sql] = `❌ ${e.message}`;
      }
    }
  }

  // ── 2. Admin kullanıcısını güncelle ───────────────────────────────────────
  if (action === "admin" || action === "all") {
    try {
      const OLD_EMAIL = "admin@premiumstore.com";
      const NEW_EMAIL = "muhammedeminturk.16@gmail.com";
      const NEW_PASSWORD = "Emin.016";
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

      const old = await db.user.findUnique({ where: { email: OLD_EMAIL } });
      if (old) {
        await db.user.delete({ where: { email: OLD_EMAIL } });
        results["eski_admin"] = `✅ silindi: ${OLD_EMAIL}`;
      }

      await db.user.upsert({
        where: { email: NEW_EMAIL },
        update: { name: "Admin", role: "ADMIN", password: hashedPassword, isBlocked: false },
        create: { email: NEW_EMAIL, name: "Admin", role: "ADMIN", password: hashedPassword },
      });

      results["yeni_admin"] = `✅ güncellendi: ${NEW_EMAIL}`;
    } catch (e: any) {
      results["admin"] = `❌ ${e.message}`;
    }
  }

  return NextResponse.json({ success: true, results });
}
