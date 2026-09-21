import { db } from "@/lib/db";

export const DEFAULT_INDEXNOW_KEY = "4bd276aa29c77b7e414dc08ad2376ec4";
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

let keyCache: { value: string; expiresAt: number } | null = null;

export function clearIndexNowKeyCache() {
  keyCache = null;
}

export async function getIndexNowKey() {
  const now = Date.now();
  if (keyCache && now < keyCache.expiresAt) return keyCache.value;

  const configuredKey = process.env.INDEXNOW_API_KEY?.trim();
  if (configuredKey) {
    keyCache = { value: configuredKey, expiresAt: now + 300_000 };
    return configuredKey;
  }

  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "global" },
      select: { indexNowKey: true },
    });
    const value = settings?.indexNowKey?.trim() || DEFAULT_INDEXNOW_KEY;
    keyCache = { value, expiresAt: now + 300_000 };
    return value;
  } catch {
    return DEFAULT_INDEXNOW_KEY;
  }
}

/**
 * Bildirim gönderilecek arama motorları — IndexNow tek API ile
 * Google, Bing, Yandex ve diğer katılımcı motorlara iletir.
 */
export async function notifyIndexNow(urlsOrSlug: string | string[]) {
  if (process.env.NODE_ENV !== "production") return;

  const urls = Array.isArray(urlsOrSlug)
    ? urlsOrSlug
    : [urlsOrSlug];

  const uniqueUrls = [...new Set(urls.filter((url) => /^https?:\/\//i.test(url)))];
  if (uniqueUrls.length === 0) return;

  try {
    const key = await getIndexNowKey();
    for (let offset = 0; offset < uniqueUrls.length; offset += MAX_URLS_PER_REQUEST) {
      const urlList = uniqueUrls.slice(offset, offset + MAX_URLS_PER_REQUEST);
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: BASE_URL.replace(/https?:\/\//, ""),
          key,
          keyLocation: `${BASE_URL}/${key}.txt`,
          urlList,
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!res.ok) {
        console.error(
          `[IndexNow] Hata: ${res.status} — ${urlList.slice(0, 3).join(", ")}`
        );
      }
    }
  } catch (err) {
    console.error("[IndexNow] İstek gönderilemedi:", err);
  }
}

/** Ürün slug'ından tam URL üretip bildirir */
export async function notifyProductUpdated(slug: string) {
  return notifyIndexNow(`${BASE_URL}/products/${slug}`);
}

/** Birden fazla ürünü bildirir (toplu import sonrası) */
export async function notifyProductsBulk(slugs: string[]) {
  const urls = slugs.map((s) => `${BASE_URL}/products/${s}`);
  return notifyIndexNow(urls);
}

/** Ana sayfa + ürünler listesini yenile */
export async function notifyHomepageRefresh() {
  return notifyIndexNow([BASE_URL, `${BASE_URL}/products`]);
}
