import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { parseHomepageConfig, removeBannerProductIds, updateBannerProductIds } from "@/lib/homepage-config";

export const dynamic = "force-dynamic";

const ALLOWED_GRADIENTS = new Set(["amber", "rose", "blue", "emerald", "zinc", "purple", "cream", "slate"]);

function normalizeBannerUpdate(input: Record<string, unknown>) {
  const output: Record<string, unknown> = {};
  if ("title" in input) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title) throw new Error("Banner başlığı boş bırakılamaz.");
    output.title = title;
  }
  for (const key of ["subtitle", "badge", "ctaText", "cta2Text", "cta2Href", "imageUrl"]) {
    if (key in input) {
      const value = input[key];
      output[key] = typeof value === "string" && value.trim() ? value.trim() : null;
    }
  }
  if ("ctaHref" in input) {
    output.ctaHref = typeof input.ctaHref === "string" && input.ctaHref.trim() ? input.ctaHref.trim() : "/products";
  }
  if ("gradient" in input) {
    output.gradient = typeof input.gradient === "string" && ALLOWED_GRADIENTS.has(input.gradient) ? input.gradient : "amber";
  }
  if ("darkText" in input) output.darkText = input.darkText === true;
  if ("isActive" in input) output.isActive = input.isActive !== false;
  if ("order" in input) {
    const order = Number(input.order);
    if (Number.isFinite(order)) output.order = Math.max(0, Math.round(order));
  }
  return output;
}

function normalizeProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, 4);
}

function revalidateBannerPages() {
  revalidatePath("/", "page");
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners", "page");
  revalidateTag("storefront-homepage");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const { id } = await params;
    const body = await req.json();
    const { productIds, ...bannerInput } = body;
    const hasProductIds = Array.isArray(productIds);
    const normalizedProductIds = normalizeProductIds(productIds);
    const { banner, savedProductIds } = await db.$transaction(async (tx) => {
      const banner = await tx.banner.update({
        where: { id },
        data: normalizeBannerUpdate(bannerInput),
      });
      const settings = await tx.siteSettings.findUnique({
        where: { id: "global" },
        select: { popularSetsJson: true },
      });
      if (hasProductIds) {
        await tx.siteSettings.upsert({
          where: { id: "global" },
          create: {
            id: "global",
            popularSetsJson: updateBannerProductIds(null, id, normalizedProductIds),
          },
          update: {
            popularSetsJson: updateBannerProductIds(
              settings?.popularSetsJson,
              id,
              normalizedProductIds,
            ),
          },
        });
        return { banner, savedProductIds: normalizedProductIds };
      }
      return {
        banner,
        savedProductIds: parseHomepageConfig(settings?.popularSetsJson).bannerProductIds[id] ?? [],
      };
    });
    revalidateBannerPages();
    return NextResponse.json({ data: { ...banner, productIds: savedProductIds } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const { id } = await params;
    await db.banner.delete({ where: { id } });
    const settings = await db.siteSettings.findUnique({
      where: { id: "global" },
      select: { popularSetsJson: true },
    });
    const nextPopularSetsJson = removeBannerProductIds(
      settings?.popularSetsJson,
      id,
    );
    if (nextPopularSetsJson !== (settings?.popularSetsJson ?? null)) {
      await db.siteSettings.upsert({
        where: { id: "global" },
        create: { id: "global", popularSetsJson: nextPopularSetsJson },
        update: { popularSetsJson: nextPopularSetsJson },
      });
    }
    revalidateBannerPages();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Silinemedi" }, { status: 500 });
  }
}
