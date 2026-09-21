import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();
  const category = await db.category.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.image !== undefined && { image: body.image }),
    },
  });
  revalidateTag("storefront-products");
  revalidateTag("storefront-homepage");
  return NextResponse.json({ data: category });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  await db.category.delete({ where: { id } });
  revalidateTag("storefront-products");
  revalidateTag("storefront-homepage");
  return NextResponse.json({ message: "Silindi." });
}
