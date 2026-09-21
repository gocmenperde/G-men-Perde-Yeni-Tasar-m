import { NextResponse } from "next/server";

/**
 * Image bytes must be loaded from the original supplier/CDN URL. Keep this
 * legacy endpoint disabled so old clients cannot turn the app into an image
 * bandwidth proxy.
 */
export const dynamic = "force-static";

export function GET() {
  return new NextResponse("Image proxy disabled", {
    status: 410,
    headers: {
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
