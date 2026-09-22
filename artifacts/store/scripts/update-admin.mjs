import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { promisify } from "util";
import { execSync } from "child_process";

// bcryptjs'i dynamic import ile kullan
const bcrypt = await import("bcryptjs");

const db = new PrismaClient();

async function main() {
  const NEW_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const NEW_PASSWORD = process.env.ADMIN_PASSWORD;
  const NEW_NAME = "Admin";

  if (!NEW_EMAIL || !NEW_PASSWORD) {
    throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD env değişkenleri gerekli.");
  }

  const hashedPassword = await bcrypt.default.hash(NEW_PASSWORD, 10);

  // Yeni admin oluştur ya da güncelle
  await db.user.upsert({
    where: { email: NEW_EMAIL },
    update: { name: NEW_NAME, role: "ADMIN", password: hashedPassword, isBlocked: false },
    create: { email: NEW_EMAIL, name: NEW_NAME, role: "ADMIN", password: hashedPassword },
  });

  console.log(`✅ Admin güncellendi: ${NEW_EMAIL}`);
}

main()
  .catch((e) => { console.error("❌ Hata:", e); process.exit(1); })
  .finally(() => db.$disconnect());
