import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicImageUrl } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    return NextResponse.json(
      {
        data: {
          siteName: settings?.siteName ?? "Göçmen Perde",
          logoUrl: getPublicImageUrl(settings?.logoUrl),
          faviconUrl: getPublicImageUrl(settings?.faviconUrl),
          phone: settings?.phone ?? null,
          whatsapp: settings?.whatsapp ?? null,
          email: settings?.email ?? null,
          address: settings?.address ?? null,
          socialInstagram: settings?.socialInstagram ?? null,
          socialFacebook: settings?.socialFacebook ?? null,
          socialTwitter: settings?.socialTwitter ?? null,
          freeShippingThreshold: settings?.freeShippingThreshold ?? 1500,
          shippingFee: settings?.shippingFee ?? 79.9,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "CDN-Cache-Control": "private, no-store",
          "Vercel-CDN-Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ data: { siteName: "Göçmen Perde", logoUrl: null } });
  }
}
