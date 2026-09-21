import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// Hepsiburada "Kırtasiye ve Okul Seti" şablon yapısı
// ─────────────────────────────────────────────────────────────

// Temel sütunlar (0-21)
const BASIC_COLS = [
  "Ürün Adı",           // 0  Zorunlu
  "Satıcı Stok Kodu",   // 1  Zorunlu
  "Barkod",             // 2  Zorunlu
  "Varyant Grup Id",    // 3  Opsiyonel
  "Ürün Açıklaması",    // 4  Zorunlu
  "Marka",              // 5  Zorunlu
  "Desi",               // 6  Zorunlu
  "KDV",                // 7  Zorunlu
  "Garanti Süresi (Ay)",// 8  Opsiyonel
  "Görsel1",            // 9  Zorunlu
  "Görsel2",            // 10 Opsiyonel
  "Görsel3",            // 11
  "Görsel4",            // 12
  "Görsel5",            // 13
  "Görsel6",            // 14
  "Görsel7",            // 15
  "Görsel8",            // 16
  "Görsel9",            // 17
  "Görsel10",           // 18
  "Fiyat",              // 19 Zorunlu
  "Stok",               // 20 Zorunlu
  "Video",              // 21 Opsiyonel
];

// Özellik sütunları (22+)
const ATTR_COLS = [
  "Ürün Tipi",          // 22 Zorunlu
];

const COLS = [...BASIC_COLS, ...ATTR_COLS];
const N = COLS.length; // 23

// Row 0 – Bölüm başlıkları
function buildRow0(): string[] {
  const row = new Array(N).fill("");
  row[0] = "Temel Ürün Bilgileri";
  row[BASIC_COLS.length] = "Özellikler";
  return row;
}

// Row 1 – Zorunlu / Opsiyonel
const MANDATORY: (string)[] = [
  "Zorunlu", "Zorunlu", "Zorunlu", "Opsiyonel", "Zorunlu",
  "Zorunlu", "Zorunlu", "Zorunlu", "Opsiyonel",
  "Zorunlu", "Opsiyonel", "Opsiyonel", "Opsiyonel", "Opsiyonel",
  "Opsiyonel", "Opsiyonel", "Opsiyonel", "Opsiyonel", "Opsiyonel",
  "Zorunlu", "Zorunlu", "Opsiyonel",
  // attr cols
  "Zorunlu", // Ürün Tipi
];

// Fiyatlandırma: maliyet × 3  →  %200 zam (yüzde 200 zamlı)
function markedUpPrice(cost: number): number {
  return Math.ceil(cost * 3 * 100) / 100;
}

// Ürün tipi: kategori adından türet; bilinmiyorsa "Kırtasiye" sabiti
function resolveProductType(categoryName: string | null | undefined): string {
  if (!categoryName) return "Kırtasiye";
  const name = categoryName.toLowerCase();
  if (name.includes("kalem")) return "Kalem";
  if (name.includes("defter")) return "Defter";
  if (name.includes("boya")) return "Boya Kalemi";
  if (name.includes("silgi")) return "Silgi";
  if (name.includes("cetvel") || name.includes("pergel")) return "Çizim Aracı";
  if (name.includes("makas")) return "Makas";
  if (name.includes("yapıştır") || name.includes("tutkal")) return "Yapıştırıcı";
  if (name.includes("dosya") || name.includes("klasör")) return "Dosyalama";
  if (name.includes("bant") || name.includes("etiket")) return "Bant ve Etiket";
  if (name.includes("karton") || name.includes("kağıt")) return "Kağıt Ürün";
  if (name.includes("sanat") || name.includes("resim")) return "Sanat Malzemesi";
  return "Kırtasiye";
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const { productIds }: { productIds: string[] } = await req.json();

  if (!productIds?.length) {
    return NextResponse.json({ error: "Ürün seçilmedi" }, { status: 400 });
  }

  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { brand: true, category: true },
  });

  if (!products.length) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  // AOA satırları
  const row0 = buildRow0();
  const row1 = MANDATORY;
  const row2 = [...COLS];

  const dataRows = products.map((p) => {
    const base     = Number(p.price);
    const price    = markedUpPrice(base);
    const images   = (p.images ?? []) as string[];
    const sku      = p.sku ?? p.id;
    const barcode  = (p as any).barcode ?? p.sku ?? p.id;
    const desc     = (p.description ?? p.name).replace(/<[^>]*>/g, "").slice(0, 500).trim();
    const brand    = p.brand?.name ?? "Diğer";
    const prodType = resolveProductType(p.category?.name);

    return [
      p.name,          // Ürün Adı
      sku,             // Satıcı Stok Kodu
      barcode,         // Barkod  ← gerçek barkod numarası
      "",              // Varyant Grup Id
      desc || p.name,  // Ürün Açıklaması  (boş bırakma)
      brand,           // Marka
      1,               // Desi
      20,              // KDV (%)
      "",              // Garanti Süresi
      images[0] ?? "", // Görsel1
      images[1] ?? "", // Görsel2
      images[2] ?? "", // Görsel3
      images[3] ?? "", // Görsel4
      images[4] ?? "", // Görsel5
      images[5] ?? "", // Görsel6
      images[6] ?? "", // Görsel7
      images[7] ?? "", // Görsel8
      images[8] ?? "", // Görsel9
      images[9] ?? "", // Görsel10
      price,           // Fiyat  (maliyet × 3 = %200 zam)
      p.stock,         // Stok
      "",              // Video
      // attr
      prodType,        // Ürün Tipi
    ];
  });

  const aoa = [row0, row1, row2, ...dataRows];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = [
    { wch: 50 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 60 },
    { wch: 20 }, { wch: 6  }, { wch: 6  }, { wch: 14 },
    { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 },
    { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 },
    { wch: 12 }, { wch: 8  }, { wch: 8  },
    { wch: 20 }, // Ürün Tipi
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Kırtasiye ve Okul Seti");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hepsiburada-${Date.now()}.xlsx"`,
    },
  });
}
