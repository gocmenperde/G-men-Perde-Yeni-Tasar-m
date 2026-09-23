import { NextResponse } from "next/server";
import { getSitemapChunkCount } from "@/lib/sitemap-data";

// Generate only on an actual request; the response's shared-cache headers
// handle repeat crawler requests without timed ISR writes.
export const dynamic = "force-dynamic";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let chunkCount = 1;
  try {
    chunkCount = await getSitemapChunkCount();
  } catch {
    // Keep the static/category sitemap available if the catalog is offline.
  }

  const entries = Array.from({ length: chunkCount }, (_, id) =>
    `<sitemap><loc>${escapeXml(BASE_URL)}/sitemap/${id}.xml</loc></sitemap>`,
  ).join("");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`,
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