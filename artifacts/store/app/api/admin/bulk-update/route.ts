import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { notifyProductsBulk } from "@/lib/indexnow";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const search = (sp.get("search") ?? "").trim();
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: { id: true, name: true, price: true, images: true, sku: true, barcode: true },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}

export async function PUT(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = await req.json() as {
      updates?: Array<{ id?: unknown; name?: unknown; price?: unknown; images?: unknown }>;
    };

    if (!Array.isArray(body.updates) || body.updates.length === 0 || body.updates.length > PAGE_SIZE) {
      return NextResponse.json({ error: "Bir sayfada 1-50 ürün kaydedilebilir." }, { status: 400 });
    }

    const updates = body.updates.map((item) => {
      const id = typeof item.id === "string" ? item.id.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const price = Number(item.price);
      const images = Array.isArray(item.images)
        ? item.images.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        : [];

      if (!id || !name) throw new Error("Ürün adı boş bırakılamaz.");
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`"${name}" için geçerli bir fiyat girin.`);
      }

      return { id, name, price, images };
    });

    const saved = await db.$transaction(
      updates.map((item) =>
        db.product.update({
          where: { id: item.id },
          data: { name: item.name, price: item.price, images: item.images },
          select: { id: true, slug: true },
        }),
      ),
    );

    notifyProductsBulk(saved.map((product) => product.slug)).catch(() => {});
    revalidateProductCatalog();

    return NextResponse.json({ ok: true, saved: saved.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ürünler kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}