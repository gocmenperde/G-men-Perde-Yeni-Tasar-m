import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  datasources: { db: { url: process.env.NEON_DATABASE_URL } },
});

function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&Ccedil;/gi, "Ç")
    .replace(/&ouml;/gi, "ö")
    .replace(/&Ouml;/gi, "Ö")
    .replace(/&uuml;/gi, "ü")
    .replace(/&Uuml;/gi, "Ü")
    .replace(/&iuml;/gi, "ï")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&atilde;/gi, "ã")
    .replace(/&otilde;/gi, "õ")
    .replace(/&agrave;/gi, "à")
    .replace(/&egrave;/gi, "è")
    .replace(/&igrave;/gi, "ì")
    .replace(/&ograve;/gi, "ò")
    .replace(/&ugrave;/gi, "ù")
    .replace(/&szlig;/gi, "ß")
    .replace(/&auml;/gi, "ä")
    .replace(/&euml;/gi, "ë")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

const BATCH = 500;
let total = 0, fixed = 0, offset = 0;

console.log("🔍 HTML entity temizleme başlıyor...");
await db.$connect();

while (true) {
  const products = await db.product.findMany({
    skip: offset,
    take: BATCH,
    where: { description: { not: null } },
    select: { id: true, description: true },
  });

  if (products.length === 0) break;
  total += products.length;

  const toUpdate = products.filter(p => p.description && /&[a-z#][a-z0-9]*;/i.test(p.description));

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(p =>
        db.product.update({
          where: { id: p.id },
          data: { description: decodeEntities(p.description) },
        })
      )
    );
    fixed += toUpdate.length;
    console.log(`[${offset + products.length}/${total + (offset)}] Düzeltilen: ${fixed}`);
  }

  offset += products.length;
}

await db.$disconnect();
console.log(`\n✅ TAMAMLANDI | Toplam tarandı: ${total} | Düzeltilen: ${fixed}`);
