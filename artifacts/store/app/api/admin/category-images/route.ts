import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const IMG = {
  pen:        "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&h=600&fit=crop&auto=format&q=75",
  pencil:     "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop&auto=format&q=75",
  colorpen:   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=75",
  notebook:   "https://images.unsplash.com/photo-1517971053567-8bde93bc6a58?w=800&h=600&fit=crop&auto=format&q=75",
  agenda:     "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop&auto=format&q=75",
  paint:      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&auto=format&q=75",
  artset:     "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&auto=format&q=75",
  school:     "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&auto=format&q=75",
  bag:        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&auto=format&q=75",
  book:       "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format&q=75",
  childbook:  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop&auto=format&q=75",
  sciencebook:"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop&auto=format&q=75",
  office:     "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&auto=format&q=75",
  scissors:   "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&h=600&fit=crop&auto=format&q=75",
  puzzle:     "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=600&fit=crop&auto=format&q=75",
  craft:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format&q=75",
  ruler:      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop&auto=format&q=75",
  eraser:     "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=800&h=600&fit=crop&auto=format&q=75",
  tape:       "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&h=600&fit=crop&auto=format&q=75",
  folder:     "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=600&fit=crop&auto=format&q=75",
  paper:      "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=800&h=600&fit=crop&auto=format&q=75",
  stamp:      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop&auto=format&q=75",
  sticker:    "https://images.unsplash.com/photo-1606770347200-f45e8cc39948?w=800&h=600&fit=crop&auto=format&q=75",
  calculator: "https://images.unsplash.com/photo-1611532736570-efea5f9d65a7?w=800&h=600&fit=crop&auto=format&q=75",
  globe:      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop&auto=format&q=75",
  toy:        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop&auto=format&q=75",
  stapler:    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop&auto=format&q=75",
  clip:       "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=800&h=600&fit=crop&auto=format&q=75",
  frame:      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=600&fit=crop&auto=format&q=75",
  gift:       "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop&auto=format&q=75",
};

const RULES: Array<{ must: string[]; any?: string[]; url: string }> = [
  // ── Kalemler ──────────────────────────────────────────────────────
  { must: ["kalem"], any: ["tukenmez","jel","dolma","roller","fineliner","markör","marker","markör"], url: IMG.pen },
  { must: ["tukenmez"],                                             url: IMG.pen },
  { must: ["jel","kalem"],                                          url: IMG.pen },
  { must: ["dolma","kalem"],                                        url: IMG.pen },
  { must: ["roller"],                                               url: IMG.pen },
  { must: ["kursun","kalem"],                                       url: IMG.pencil },
  { must: ["kurşun"],                                               url: IMG.pencil },
  { must: ["kalemler","yazi"],                                      url: IMG.pen },
  { must: ["kalem"], any: ["renkli","pastel","kuru","kece","boya","renk"], url: IMG.colorpen },
  { must: ["fosfor"],                                               url: IMG.colorpen },
  { must: ["isaretleyici"],                                         url: IMG.colorpen },
  { must: ["markör"],                                               url: IMG.colorpen },
  { must: ["marker"],                                               url: IMG.colorpen },
  { must: ["keçeli"],                                               url: IMG.colorpen },
  { must: ["kece"],                                                 url: IMG.colorpen },
  // ── Kalem genel (fallback — hiçbir alt kural eşleşmezse) ─────────
  { must: ["kalem"],                                                url: IMG.pen },
  { must: ["kalemler"],                                             url: IMG.pen },
  // ── Boyalar ───────────────────────────────────────────────────────
  { must: ["boya"], any: ["seti","sulu","akrilik","guaj","pastel","seri","kuru"], url: IMG.artset },
  { must: ["boyalar"],                                              url: IMG.artset },
  { must: ["boya","defter"],                                        url: IMG.artset },
  { must: ["resim"],                                                url: IMG.artset },
  { must: ["cizim"],                                                url: IMG.artset },
  { must: ["sanat"], any: ["seti","malzeme","gerec"],               url: IMG.artset },
  { must: ["sulu","boya"],                                          url: IMG.paint },
  { must: ["akrilik"],                                              url: IMG.paint },
  { must: ["guaj"],                                                 url: IMG.paint },
  // ── Defterler ─────────────────────────────────────────────────────
  { must: ["defter"],                                               url: IMG.notebook },
  { must: ["not","defteri"],                                        url: IMG.notebook },
  { must: ["çizgili"],                                              url: IMG.notebook },
  { must: ["kareli"],                                               url: IMG.notebook },
  { must: ["ajanda"],                                               url: IMG.agenda },
  { must: ["planlayici"],                                           url: IMG.agenda },
  { must: ["akademik"],                                             url: IMG.agenda },
  // ── Çantalar ──────────────────────────────────────────────────────
  { must: ["canta"],                                                url: IMG.bag },
  { must: ["sirt"],                                                 url: IMG.bag },
  { must: ["okul","cantasi"],                                       url: IMG.bag },
  { must: ["kalem","kutus"],                                        url: IMG.bag },
  // ── Kesici & Yapıştırıcı ──────────────────────────────────────────
  { must: ["makas"],                                                url: IMG.scissors },
  { must: ["cetvel"],                                               url: IMG.ruler },
  { must: ["pergel"],                                               url: IMG.ruler },
  { must: ["gönye"],                                                url: IMG.ruler },
  { must: ["gonye"],                                                url: IMG.ruler },
  { must: ["silgi"],                                                url: IMG.eraser },
  { must: ["silgiler"],                                             url: IMG.eraser },
  { must: ["kalem","tiras"],                                        url: IMG.eraser },
  { must: ["traş"],                                                 url: IMG.eraser },
  { must: ["tras"],                                                 url: IMG.eraser },
  { must: ["bant"],                                                 url: IMG.tape },
  { must: ["seloteyp"],                                             url: IMG.tape },
  { must: ["yapistirici"],                                          url: IMG.tape },
  { must: ["tutkal"],                                               url: IMG.tape },
  { must: ["yapistir"],                                             url: IMG.tape },
  // ── Dosyalama & Kağıt ─────────────────────────────────────────────
  { must: ["dosya"],                                                url: IMG.folder },
  { must: ["klasor"],                                               url: IMG.folder },
  { must: ["klasör"],                                               url: IMG.folder },
  { must: ["arsiv"],                                                url: IMG.folder },
  { must: ["kagit"],                                                url: IMG.paper },
  { must: ["kağıt"],                                                url: IMG.paper },
  { must: ["karton"],                                               url: IMG.paper },
  { must: ["bloknot"],                                              url: IMG.paper },
  { must: ["fotokopi"],                                             url: IMG.paper },
  { must: ["etiket"],                                               url: IMG.sticker },
  { must: ["stiker"],                                               url: IMG.sticker },
  { must: ["sticker"],                                              url: IMG.sticker },
  { must: ["yapıskan"],                                             url: IMG.sticker },
  // ── Ofis Gereçleri ────────────────────────────────────────────────
  { must: ["zımba"],                                                url: IMG.stapler },
  { must: ["zimba"],                                                url: IMG.stapler },
  { must: ["ataç"],                                                 url: IMG.clip },
  { must: ["atac"],                                                 url: IMG.clip },
  { must: ["raptiye"],                                              url: IMG.clip },
  { must: ["clips"],                                                url: IMG.clip },
  { must: ["hesap","makinesi"],                                     url: IMG.calculator },
  { must: ["hesap","makin"],                                        url: IMG.calculator },
  { must: ["kaşe"],                                                 url: IMG.stamp },
  { must: ["mühür"],                                                url: IMG.stamp },
  { must: ["damga"],                                                url: IMG.stamp },
  { must: ["ofis"], any: ["malzeme","gerec","seti"],                url: IMG.office },
  { must: ["ofis"],                                                 url: IMG.office },
  // ── Okul Seti / Genel ─────────────────────────────────────────────
  { must: ["okul"], any: ["seti","malzeme","gerec","araci"],        url: IMG.school },
  { must: ["okul"],                                                 url: IMG.school },
  { must: ["anaokul"],                                              url: IMG.childbook },
  // ── El İşi / Hobi ─────────────────────────────────────────────────
  { must: ["el","isi"],                                             url: IMG.craft },
  { must: ["hobi"],                                                 url: IMG.craft },
  { must: ["origami"],                                              url: IMG.craft },
  { must: ["keçe","hobi"],                                          url: IMG.craft },
  // ── Oyuncak & Eğitici ─────────────────────────────────────────────
  { must: ["yapboz"],                                               url: IMG.puzzle },
  { must: ["bulmaca"],                                              url: IMG.puzzle },
  { must: ["oyuncak"],                                              url: IMG.toy },
  { must: ["oyun"],                                                 url: IMG.toy },
  { must: ["lego"],                                                 url: IMG.toy },
  // ── Coğrafya / Küre ───────────────────────────────────────────────
  { must: ["kure"],                                                 url: IMG.globe },
  { must: ["harita"],                                               url: IMG.globe },
  { must: ["dünya"],                                                url: IMG.globe },
  // ── Çerçeve & Sunum ───────────────────────────────────────────────
  { must: ["cerceve"],                                              url: IMG.frame },
  { must: ["çerçeve"],                                              url: IMG.frame },
  { must: ["pano"],                                                 url: IMG.frame },
  { must: ["beyaz","tahta"],                                        url: IMG.frame },
  // ── Kitaplar ──────────────────────────────────────────────────────
  { must: ["cocuk"], any: ["kitap","hikaye","masal","roman","seri"], url: IMG.childbook },
  { must: ["hikaye"],                                               url: IMG.childbook },
  { must: ["masal"],                                                url: IMG.childbook },
  { must: ["bilim"],                                                url: IMG.sciencebook },
  { must: ["ansiklopedi"],                                          url: IMG.sciencebook },
  { must: ["tarih"],                                                url: IMG.sciencebook },
  { must: ["felsefe"],                                              url: IMG.sciencebook },
  { must: ["roman"],                                                url: IMG.book },
  { must: ["edebiyat"],                                             url: IMG.book },
  { must: ["kitap"], any: ["seti","koleksiyon","serisi"],           url: IMG.book },
  { must: ["kitap"],                                                url: IMG.book },
  // ── Hediye ────────────────────────────────────────────────────────
  { must: ["hediye"],                                               url: IMG.gift },
  { must: ["set"], any: ["hediye","özel","premium"],                url: IMG.gift },
];

function findImage(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  const wordSet = new Set(words);

  for (const rule of RULES) {
    const mustOk = rule.must.every((w) => wordSet.has(w) || slug.includes(w));
    if (!mustOk) continue;

    if (rule.any) {
      const anyOk = rule.any.some((w) => wordSet.has(w) || slug.includes(w));
      if (!anyOk) continue;
    }

    return rule.url;
  }

  return IMG.school;
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const { categoryId, categoryName, categorySlug } = (await req.json()) as {
      categoryId: string;
      categoryName: string;
      categorySlug?: string;
    };
    if (!categoryId || !categoryName)
      return NextResponse.json({ error: "categoryId ve categoryName gerekli" }, { status: 400 });

    const slug = (categorySlug ?? categoryName)
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const image = findImage(slug);

    if (!image) return NextResponse.json({ saved: false, image: null });

    await db.category.update({
      where: { id: categoryId },
      data: { image },
    });
    revalidateTag("storefront-homepage");

    return NextResponse.json({ saved: true, image });
  } catch (e) {
    console.error("[category-images]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
