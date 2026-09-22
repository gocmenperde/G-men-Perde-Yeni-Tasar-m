import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getConfiguredAdminCredentials } from "@/lib/admin-credentials";
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
      const configuredAdmin = getConfiguredAdminCredentials();
      if (!configuredAdmin) {
        results["admin"] = "❌ ADMIN_EMAIL ve ADMIN_PASSWORD env değişkenleri gerekli";
      } else {
        const hashedPassword = await bcrypt.hash(configuredAdmin.password, 10);

        await db.user.upsert({
          where: { email: configuredAdmin.email },
          update: { name: "Admin", role: "ADMIN", password: hashedPassword, isBlocked: false },
          create: { email: configuredAdmin.email, name: "Admin", role: "ADMIN", password: hashedPassword },
        });

        results["admin"] = `✅ güncellendi: ${configuredAdmin.email}`;
      }
    } catch (e: any) {
      results["admin"] = `❌ ${e.message}`;
    }
  }

  return NextResponse.json({ success: true, results });
}
