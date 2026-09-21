import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import AdminOrdersClient from "@/components/admin/orders-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Siparişler" };

export default async function AdminOrdersPage() {
  const rawOrders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const orders = rawOrders.map(serializeOrder);
  return <AdminOrdersClient orders={orders} />;
}
