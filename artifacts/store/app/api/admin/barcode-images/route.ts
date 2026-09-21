import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const barcode = req.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json({ error: "barcode gerekli" }, { status: 400 });

  const record = await (db as any).barcodeImage.findUnique({ where: { barcode } });
  return NextResponse.json({ images: record?.images ?? [], source: record?.source ?? null });
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const { barcode, images, source } = await req.json();
  if (!barcode || !images?.length)
    return NextResponse.json({ error: "barcode ve images gerekli" }, { status: 400 });

  const record = await (db as any).barcodeImage.upsert({
    where: { barcode },
    update: { images, source, updatedAt: new Date() },
    create: { barcode, images, source },
  });
  return NextResponse.json({ ok: true, id: record.id });
}
