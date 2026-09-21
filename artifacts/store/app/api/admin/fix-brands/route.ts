import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import slugify from "slugify";

export const dynamic = "force-dynamic";

// Sadece önizleme — hiçbir şey değiştirmez
export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const brands = await db.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });

    const numeric = brands.filter((b) => isSayisalMarka(b.name));
    return NextResponse.json({ preview: numeric, total: brands.length });
  } catch {
    return NextResponse.json({ error: "Ön izleme başarısız." }, { status: 500 });
  }
}

// Gerçek düzeltme
export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const brands = await db.brand.findMany({
      include: { _count: { select: { products: true } } },
    });

    const sayisalMarkalar = brands.filter((b) => isSayisalMarka(b.name));

    if (sayisalMarkalar.length === 0) {
      return NextResponse.json({ message: "Sayısal marka bulunamadı.", fixed: 0, deleted: 0 });
    }

    // "Bilinmeyen Marka" oluştur veya bul
    const bilinmeyenSlug = "bilinmeyen-marka";
    let bilinmeyen = await db.brand.findUnique({ where: { slug: bilinmeyenSlug } });
    if (!bilinmeyen) {
      bilinmeyen = await db.brand.create({
        data: { name: "Bilinmeyen Marka", slug: bilinmeyenSlug },
      });
    }

    let fixedProducts = 0;
    let deletedBrands = 0;

    for (const brand of sayisalMarkalar) {
      // Bu markaya ait ürünleri "Bilinmeyen Marka"ya taşı
      if (brand._count.products > 0) {
        const result = await db.product.updateMany({
          where: { brandId: brand.id },
          data: { brandId: bilinmeyen!.id },
        });
        fixedProducts += result.count;
      }

      // Markayı sil (Bilinmeyen Marka kendisi değilse)
      if (brand.id !== bilinmeyen!.id) {
        try {
          await db.brand.delete({ where: { id: brand.id } });
          deletedBrands++;
        } catch {
          // Silinemeyen markalar için slug güncelle
          const newSlug = `sayisal-${brand.id.slice(-6)}`;
          await db.brand.update({
            where: { id: brand.id },
            data: { name: `[Düzeltildi] ${brand.name}`, slug: newSlug },
          });
        }
      }
    }

    return NextResponse.json({
      message: `${deletedBrands} sayısal marka silindi, ${fixedProducts} ürün "Bilinmeyen Marka"ya taşındı.`,
      fixed: fixedProducts,
      deleted: deletedBrands,
      bilinmeyenId: bilinmeyen!.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Düzeltme başarısız." }, { status: 500 });
  }
}

// Sayısal marka tespiti
// Şunları sayısal sayar:
//   - Tamamen rakamlardan oluşan: "1234567"
//   - Rakam + tire/boşluk/nokta: "123-456", "12 345"
//   - Çok kısa rakam+harf karışımı ama anlamlı değil: "12AB", "AB12" (3M gibi gerçek markalar hariç)
// Şunları sayısal SAYMAZ (gerçek markalar):
//   - "3M", "4711", "365" (tanınmış marka isimleri)
//   - Harf ağırlıklı: "Black & Decker 750W"
function isSayisalMarka(name: string): boolean {
  const trimmed = name.trim();

  // Tamamen rakam
  if (/^\d+$/.test(trimmed)) return true;

  // Rakam + tire/boşluk/nokta/virgül kombinasyonu (barkod formatları)
  if (/^[\d\s\-\.\/,]+$/.test(trimmed)) return true;

  // Çok uzun tamamen rakamdan oluşan (8+ karakter) → barkod
  if (/^\d{8,}/.test(trimmed)) return true;

  // Rakam yüzdesi %70+ ve uzunluk 6+ ise (ör: "1234AB")
  const digits = (trimmed.match(/\d/g) || []).length;
  if (trimmed.length >= 5 && digits / trimmed.length >= 0.7) return true;

  return false;
}
