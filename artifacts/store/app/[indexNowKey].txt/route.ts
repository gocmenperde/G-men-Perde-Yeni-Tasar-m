import { NextRequest, NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{}> },
) {
  const { indexNowKey } = (await params) as { indexNowKey?: string };
  if (!indexNowKey) return new NextResponse("Bulunamadı", { status: 404 });
  const key = await getIndexNowKey();
  if (indexNowKey !== key) return new NextResponse("Bulunamadı", { status: 404 });
  return new NextResponse(`${key}\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}