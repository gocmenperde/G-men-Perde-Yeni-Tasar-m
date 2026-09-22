import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";

export type SiteSettings = {
  id: string;
  siteName: string;
  indexNowKey?: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  announcementText: string | null;
  announcementActive: boolean;
  announcementColor: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBadge: string | null;
  heroDesc: string | null;
  heroCtaPrimaryText: string | null;
  heroCtaPrimaryHref: string | null;
  heroCtaSecText: string | null;
  heroCtaSecHref: string | null;
  trustBadge1Text: string | null;
  trustBadge1Sub: string | null;
  trustBadge2Text: string | null;
  trustBadge2Sub: string | null;
  trustBadge3Text: string | null;
  trustBadge3Sub: string | null;
  stat1Value: string | null;
  stat1Label: string | null;
  stat2Value: string | null;
  stat2Label: string | null;
  stat3Value: string | null;
  stat3Label: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  popularSetsJson: string | null;
  homepageVideoUrl: string | null;
  homepageVideoSource: string | null;
  freeShippingThreshold?: number;
  shippingFee?: number;
} | null;

const TTL_MS = 60_000;
let _cache: { data: SiteSettings; expiresAt: number } | null = null;

const fetchSettingsFromDataCache = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      // SELECT * keeps the storefront usable while an additive settings
      // column is being rolled out to an existing database.
      const rows = await db.$queryRaw<SiteSettings[]>`
        SELECT * FROM "SiteSettings" WHERE "id" = 'global' LIMIT 1
      `;
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },
  ["storefront-site-settings-v1"],
  { revalidate: false, tags: ["storefront-settings"] },
);

async function fetchSettingsFromDb(): Promise<SiteSettings> {
  const now = Date.now();
  if (_cache && now < _cache.expiresAt) return _cache.data;

  const data = await fetchSettingsFromDataCache();
  _cache = { data, expiresAt: now + TTL_MS };
  return data;
}

/**
 * Use this for customer-facing content that must reflect an admin save
 * immediately. The cached settings helper is intentionally kept for the
 * shared shell, but a gallery update should never wait for another cache
 * instance or an ISR invalidation to expire.
 */
export async function getLiveSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.$queryRaw<SiteSettings[]>`
      SELECT * FROM "SiteSettings" WHERE "id" = 'global' LIMIT 1
    `;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function bustSettingsCache() {
  _cache = null;
}

export const getCachedSettings = cache(fetchSettingsFromDb);
