import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";
import { getSitemapChunkCount, getSitemapEntries } from "@/lib/sitemap-data";

// Generate only on an actual request; the response's shared-cache headers
// handle repeat crawler requests without timed ISR writes.
export const dynamic = "force-dynamic";
const MAX_SITEMAP_ID = 1000;

const NOT_FOUND_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function renderEntry(entry: MetadataRoute.Sitemap[number]) {
  const images = Array.isArray(entry.images) ? entry.images : [];
  const imageXml = images
    .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
    .join("");
  const lastModified = entry.lastModified
    ? `<lastmod>${escapeXml(formatDate(entry.lastModified))}</lastmod>`
    : "";
  const changeFrequency = entry.changeFrequency
    ? `<changefreq>${entry.changeFrequency}</changefreq>`
    : "";
  const priority = entry.priority === undefined ? "" : `<priority>${entry.priority}</priority>`;

  return `<url><loc>${escapeXml(entry.url)}</loc>${lastModified}${changeFrequency}${priority}${imageXml}</url>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{}> },
) {
  const routeParams = (await params) as { id?: string };
  const sitemapId = Number(routeParams.id);
  if (
    !Number.isSafeInteger(sitemapId) ||
    sitemapId < 0 ||
    sitemapId > MAX_SITEMAP_ID
  ) {
    return new NextResponse("Sitemap bulunamadı", {
      status: 404,
      headers: NOT_FOUND_HEADERS,
    });
  }

  // Geçersiz yüksek id'ler için Prisma'nın büyük OFFSET sorgusu çalışmasın.
  // Sitemap index'inde olmayan parçalar doğrudan 404 dönmelidir.
  let chunkCount = 1;
  try {
    chunkCount = await getSitemapChunkCount();
  } catch {
    // The static sitemap section must remain crawlable during a catalog DB
    // outage. Product chunks cannot be validated without the live count.
    if (sitemapId !== 0) {
      return new NextResponse("Sitemap bulunamadı", {
        status: 404,
        headers: NOT_FOUND_HEADERS,
      });
    }
  }
  if (sitemapId >= chunkCount) {
    return new NextResponse("Sitemap bulunamadı", {
      status: 404,
      headers: NOT_FOUND_HEADERS,
    });
  }

  const entries = await getSitemapEntries(sitemapId);
  const body = entries.map(renderEntry).join("");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}