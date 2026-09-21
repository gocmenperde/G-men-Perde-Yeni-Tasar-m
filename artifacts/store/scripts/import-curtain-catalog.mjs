import { readFile } from "node:fs/promises";
    import { PrismaClient } from "@prisma/client";
    import slugify from "slugify";

    const db = new PrismaClient();
    const categories = JSON.parse(await readFile(new URL("../data/gocmen-categories.source.json", import.meta.url), "utf8"));
    const products = JSON.parse(await readFile(new URL("../data/gocmen-products.source.json", import.meta.url), "utf8"));
    let created = 0;
    let updated = 0;
    try {
    const categoryIds = new Map();
    for (const category of categories) {
      const saved = await db.category.upsert({
        where: { slug: category.key },
        update: { name: category.label, image: category.image || null },
        create: { name: category.label, slug: category.key, image: category.image || null },
      });
      categoryIds.set(category.key, saved.id);
    }
    const brand = await db.brand.upsert({
      where: { slug: "gocmen-perde" },
      update: { name: "Göçmen Perde" },
      create: { name: "Göçmen Perde", slug: "gocmen-perde" },
    });
    for (const source of products) {
      const slug = slugify(source.id || source.name, { lower: true, strict: true, locale: "tr" });
      const data = {
        name: source.name, slug, sku: source.barcode || `GP-${source.id}`, description: source.desc || null,
        price: Number(source.price), comparePrice: source.oldPrice == null ? null : Number(source.oldPrice),
        stock: Number(source.stock ?? 0), images: Array.isArray(source.images) && source.images.length ? source.images : [source.image],
        isFeatured: Boolean(source.isFeatured), isActive: source.active !== false, barcode: source.barcode || null,
        tags: [...new Set([source.cat, ...(source.seoKeywords ?? [])])], categoryId: categoryIds.get(source.cat) ?? null,
        brandId: brand.id, unit: source.unit || "adet", isMeter: Boolean(source.isMeter), isSquareMeter: Boolean(source.isSquareMeter),
        requiresWidth: Boolean(source.requiresWidth), requiresHeight: Boolean(source.requiresHeight), features: source.features || null,
        badge: source.badge || null, shippingFee: source.shippingFee == null ? null : Number(source.shippingFee),
        shippingNote: source.shippingNote || null, serialNumber: source.serialNumber || null, specs: source.specs ?? null, care: source.care ?? null,
      };
      const existing = await db.product.findUnique({ where: { slug }, select: { id: true } });
      await db.product.upsert({ where: { slug }, update: data, create: data });
      if (existing) updated += 1; else created += 1;
    }
    await db.siteSettings.upsert({ where: { id: "global" }, update: { siteName: "Göçmen Perde" }, create: { id: "global", siteName: "Göçmen Perde" } });
    console.log(JSON.stringify({ ok: true, categories: categoryIds.size, products: products.length, created, updated }, null, 2));
    } finally { await db.$disconnect(); }
    