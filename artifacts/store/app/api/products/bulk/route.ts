import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { notifyProductsBulk, notifyHomepageRefresh } from "@/lib/indexnow";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const { products } = await req.json();
    if (!Array.isArray(products) || products.length === 0)
      return NextResponse.json({ error: "Ürün listesi boş." }, { status: 400 });

    // Cache categories and brands by name (case-insensitive)
    const [allCategories, allBrands] = await Promise.all([
      db.category.findMany({ select: { id: true, name: true, slug: true } }),
      db.brand.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    const catByName = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));
    const catBySlug = new Map(allCategories.map((c) => [c.slug.toLowerCase(), c.id]));
    const brandByName = new Map(allBrands.map((b) => [b.name.toLowerCase(), b.id]));
    const brandBySlug = new Map(allBrands.map((b) => [b.slug.toLowerCase(), b.id]));

    const resolveCategory = (val?: string) => {
      if (!val) return null;
      const key = val.toLowerCase().trim();
      return catByName.get(key) ?? catBySlug.get(key) ?? null;
    };
    const resolveBrand = (val?: string) => {
      if (!val) return null;
      const key = val.toLowerCase().trim();
      return brandByName.get(key) ?? brandBySlug.get(key) ?? null;
    };

    const results: { index: number; name: string; success: boolean; slug?: string; error?: string }[] = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        if (!p.name || p.price === undefined || p.price === null)
          throw new Error("Ad ve fiyat zorunludur.");

        const price = Number(p.price);
        if (isNaN(price) || price < 0) throw new Error("Geçersiz fiyat.");

        let slug = slugify(p.name, { lower: true, strict: true, locale: "tr" });
        const existing = await db.product.findUnique({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now()}-${i}`;

        const comparePrice = p.comparePrice != null && p.comparePrice !== "" ? Number(p.comparePrice) : null;

        await db.product.create({
          data: {
            name: String(p.name).trim(),
            slug,
            sku: p.sku ? String(p.sku).trim() : null,
            description: p.description ? String(p.description).trim() : null,
            price,
            comparePrice: comparePrice && !isNaN(comparePrice) ? comparePrice : null,
            stock: p.stock != null ? Number(p.stock) || 0 : 0,
            images: Array.isArray(p.images) ? p.images : p.imageUrl ? [p.imageUrl] : [],
            isFeatured: Boolean(p.isFeatured),
            isActive: p.isActive !== false && p.isActive !== "false" && p.isActive !== "0",
            categoryId: resolveCategory(p.category),
            brandId: resolveBrand(p.brand),
            tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : [],
          },
        });

        results.push({ index: i, name: p.name, success: true, slug });
      } catch (err: any) {
        results.push({ index: i, name: p.name ?? `Satır ${i + 2}`, success: false, error: err.message });
      }
    }

    const success = results.filter((r) => r.success).length;
    const errors  = results.filter((r) => !r.success);

    // IndexNow: başarıyla eklenen ürünleri ve ana sayfayı Google/Bing'e bildir
    const newSlugs = results.filter((r) => r.success && (r as any).slug).map((r) => (r as any).slug as string);
    if (newSlugs.length > 0) {
      notifyProductsBulk(newSlugs).catch(() => {});
      notifyHomepageRefresh().catch(() => {});
      revalidateProductCatalog();
    }

    return NextResponse.json({ success, errors, total: products.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Toplu içe aktarma başarısız." }, { status: 500 });
  }
}
