const LOCAL_IMAGE_PATH = /^\//;
const MAX_IMAGE_URL_LENGTH = 2048;

/**
 * Only URLs that the browser can request directly are allowed to cross the
 * server/client boundary. In particular, never serialize data/blob URLs:
 * their bytes would be embedded in the RSC/HTML response and counted as
 * application-origin transfer even when the client later refuses to render
 * them.
 */
export function getPublicImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw || raw.length > MAX_IMAGE_URL_LENGTH) return null;
  if (raw.startsWith("//")) return null;

  if (LOCAL_IMAGE_PATH.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeImageList(value: unknown, limit?: number): string[] {
  const values = Array.isArray(value) ? value : [value];
  const images = values
    .map(getPublicImageUrl)
    .filter((image): image is string => Boolean(image));

  return [...new Set(images)].slice(0, limit ?? images.length);
}

/**
 * Product images are imported from supplier/CDN sources. Keep those requests
 * on the supplier/CDN origin so the storefront does not proxy image bytes
 * through the application server.
 */
export function getProductImageCandidates(value: unknown): string[] {
  return sanitizeImageList(value);
}

/**
 * Cloudinary already fronts a portion of the catalogue. Ask that CDN for a
 * browser-sized, automatically encoded asset instead of downloading the
 * supplier's original bytes. Non-Cloudinary URLs are deliberately unchanged.
 *
 * The original URL is kept as a fallback so an existing asset never becomes
 * unavailable just because a transformation is not accepted by the provider.
 */
export function getCdnOptimizedImageUrl(value: string): string {
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith("res.cloudinary.com")) return value;

    const imageMarker = /\/image\/(fetch|upload)\//;
    const match = url.pathname.match(imageMarker);
    if (!match || /(?:^|[/,])(?:f_auto|q_auto)(?:$|[/,])/.test(url.pathname)) {
      return value;
    }

    const marker = `/image/${match[1]}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return value;

    const insertionPoint = markerIndex + marker.length;
    url.pathname = `${url.pathname.slice(0, insertionPoint)}f_auto,q_auto/${url.pathname.slice(insertionPoint)}`;
    return url.toString();
  } catch {
    return value;
  }
}

export function getProductImageSrc(value: unknown): string {
  return getProductImageCandidates(value)[0] ?? "";
}