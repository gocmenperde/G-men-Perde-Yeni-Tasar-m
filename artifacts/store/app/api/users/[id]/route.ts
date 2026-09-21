import { NextRequest, NextResponse } from "next/server";
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
  const user = await db.user.update({
    where: { id },
    data: {
      ...(body.role && { role: body.role }),
      ...(body.isBlocked !== undefined && { isBlocked: body.isBlocked }),
    },
  });
  return NextResponse.json({ data: user });
}
