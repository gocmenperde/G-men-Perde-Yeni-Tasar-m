import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { clearIndexNowKeyCache, DEFAULT_INDEXNOW_KEY } from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

function payload(key: string) {
  return {
    key,
    keyLocation: `${BASE_URL}/${key}.txt`,
    sitemapUrl: `${BASE_URL}/sitemap.xml`,
  };
}

async function getStoredKey() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "global" },
      select: { indexNowKey: true },
    });
    return settings?.indexNowKey?.trim() || DEFAULT_INDEXNOW_KEY;
  } catch {
    return DEFAULT_INDEXNOW_KEY;
  }
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  return NextResponse.json(payload(await getStoredKey()));
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const key = randomBytes(16).toString("hex");
  try {
    await db.siteSettings.upsert({
      where: { id: "global" },
      create: { id: "global", indexNowKey: key },
      update: { indexNowKey: key },
    });
    clearIndexNowKeyCache();
    return NextResponse.json(payload(key), { status: 201 });
  } catch (error) {
    try {
      await db.$executeRawUnsafe(
        'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "indexNowKey" TEXT',
      );
      await db.siteSettings.update({
        where: { id: "global" },
        data: { indexNowKey: key },
      });
      clearIndexNowKeyCache();
      return NextResponse.json(payload(key), { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "IndexNow anahtarı kaydedilemedi. Veritabanı migration'ını uygulayıp tekrar deneyin." },
        { status: 500 },
      );
    }
  }
}