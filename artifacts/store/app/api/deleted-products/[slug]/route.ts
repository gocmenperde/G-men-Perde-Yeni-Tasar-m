import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

function response(status: number) {
  return new NextResponse(null, {
    status,
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

// Middleware tarafından dahili olarak çağrılır.
// Slug silindi mi? 200 = evet (410 dön), 404 = hayır (normal devam et).
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const record = await db.deletedProduct.findUnique({
      where: { slug },
      select: { id: true },
    });
    return response(record ? 200 : 404);
  } catch {
    return response(404);
  }
}
