import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi." });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();
  const coupon = await db.coupon.update({
    where: { id },
    data: { isActive: Boolean(body.isActive) },
  });
  return NextResponse.json({ data: coupon });
}
