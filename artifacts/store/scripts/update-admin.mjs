import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { promisify } from "util";
import { execSync } from "child_process";

// bcryptjs'i dynamic import ile kullan
const bcrypt = await import("bcryptjs");

const db = new PrismaClient();

async function main() {
  const OLD_EMAIL = "admin@premiumstore.com";
  const NEW_EMAIL = "muhammedeminturk.16@gmail.com";
  const NEW_PASSWORD = "Emin.016";
  const NEW_NAME = "Admin";

  const hashedPassword = await bcrypt.default.hash(NEW_PASSWORD, 10);

  // Eski admin varsa sil
  const oldAdmin = await db.user.findUnique({ where: { email: OLD_EMAIL } });
  if (oldAdmin) {
    await db.user.delete({ where: { email: OLD_EMAIL } });
    console.log(`✅ Eski admin silindi: ${OLD_EMAIL}`);
  }

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
