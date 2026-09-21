import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { sendOrderStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const { id } = await params;

    const body = await req.json();
    const { status, trackingNumber, trackingCompany, adminNote } = body;

    const validStatuses = [
      "PENDING", "PROCESSING", "SHIPPED", "DELIVERED",
      "CANCELED", "AWAITING_PAYMENT", "PAYMENT_FAILED",
    ];
    if (status && !validStatuses.includes(status))
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });

    const data: Record<string, any> = {};
    if (status) data.status = status;
    if (typeof trackingNumber !== "undefined") data.trackingNumber = trackingNumber || null;
    if (typeof trackingCompany !== "undefined") data.trackingCompany = trackingCompany || null;
    if (typeof adminNote !== "undefined") data.adminNote = adminNote || null;

    const order = await db.order.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    const EMAIL_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];
    if (status && EMAIL_STATUSES.includes(status)) {
      sendOrderStatusEmail({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        trackingNumber: order.trackingNumber,
        trackingCompany: order.trackingCompany,
        user: order.user,
        items: order.items.map((i) => ({
          quantity: i.quantity,
          price: Number(i.price),
          product: { name: i.product.name },
        })),
      }).catch(() => {});
    }

    return NextResponse.json({ data: order });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
