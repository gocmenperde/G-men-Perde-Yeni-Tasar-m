import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const CLOUDINARY_FOLDER = "premium-store";

/**
 * Video bytes must not pass through the Next/Vercel function: production
 * serverless requests have a much smaller body limit than the upload UI.
 * This route only returns a short-lived signature; the browser uploads the
 * file directly to Cloudinary afterwards.
 */
export async function POST(request: NextRequest) {
  if (!await isAdminAuthorized(request)) return unauthorizedResponse();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Video yükleme için Cloudinary ayarları eksik. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET tanımlanmalı.",
      },
      { status: 503 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder: CLOUDINARY_FOLDER,
    resourceType: "video",
  });
}