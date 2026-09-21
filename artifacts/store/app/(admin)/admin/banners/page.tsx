import { db } from "@/lib/db";
import BannersClient from "@/components/admin/banners-client";
import { parseHomepageConfig } from "@/lib/homepage-config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Banner Yönetimi · Admin" };

export default async function AdminBannersPage() {
  const [banners, settings] = await Promise.all([
    db.banner.findMany({ orderBy: { order: "asc" } }),
    db.siteSettings.findUnique({
      where: { id: "global" },
      select: { popularSetsJson: true },
    }),
  ]);
  const productIds = parseHomepageConfig(settings?.popularSetsJson).bannerProductIds;
  return (
    <BannersClient
      initial={banners.map((banner) => ({
        ...banner,
        productIds: productIds[banner.id] ?? [],
      }))}
    />
  );
}
