import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { parseHomepageConfig, updateBannerProductIds } from "@/lib/homepage-config";

export const dynamic = "force-dynamic";

const ALLOWED_GRADIENTS = new Set(["amber", "rose", "blue", "emerald", "zinc", "purple", "cream", "slate"]);

function normalizeBannerInput(input: Record<string, unknown>, fallbackOrder: number) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) throw new Error("Banner başlığı zorunludur.");
  const gradient = typeof input.gradient === "string" && ALLOWED_GRADIENTS.has(input.gradient)
    ? input.gradient
    : "amber";
  const optionalText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
  const numericOrder = Number(input.order);
  return {
    title,
    subtitle: optionalText(input.subtitle),
    badge: optionalText(input.badge),
    ctaText: optionalText(input.ctaText),
    ctaHref: optionalText(input.ctaHref) ?? "/products",
    cta2Text: optionalText(input.cta2Text),
    cta2Href: optionalText(input.cta2Href),
    imageUrl: optionalText(input.imageUrl),
    gradient,
    darkText: input.darkText === true,
    isActive: input.isActive !== false,
    order: Number.isFinite(numericOrder) ? Math.max(0, Math.round(numericOrder)) : fallbackOrder,
  };
}

function revalidateBannerPages() {
  revalidatePath("/", "page");
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners", "page");
  revalidateTag("storefront-homepage");
}

export async function GET() {
  try {
    const [banners, settings] = await Promise.all([
      db.banner.findMany({ orderBy: { order: "asc" } }),
      db.siteSettings.findUnique({
        where: { id: "global" },
        select: { popularSetsJson: true },
      }),
    ]);
    const productIds = parseHomepageConfig(settings?.popularSetsJson).bannerProductIds;
    return NextResponse.json({
      data: banners.map((banner) => ({
        ...banner,
        productIds: productIds[banner.id] ?? [],
      })),
    });
  } catch {
    return NextResponse.json({ error: "Bannerlar alınamadı" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const body = await req.json();
    const count = await db.banner.count();
    const { productIds, ...bannerInput } = body;
    const banner = await db.banner.create({
      data: normalizeBannerInput(bannerInput, count),
    });
    if (Array.isArray(productIds)) {
      const settings = await db.siteSettings.findUnique({
        where: { id: "global" },
        select: { popularSetsJson: true },
      });
      await db.siteSettings.upsert({
        where: { id: "global" },
        create: {
          id: "global",
          popularSetsJson: updateBannerProductIds(null, banner.id, productIds),
        },
        update: {
          popularSetsJson: updateBannerProductIds(
            settings?.popularSetsJson,
            banner.id,
            productIds,
          ),
        },
      });
    }
    revalidateBannerPages();
    return NextResponse.json({
      data: { ...banner, productIds: Array.isArray(productIds) ? productIds : [] },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Oluşturulamadı" }, { status: 500 });
  }
}
