import { getServerToken } from "@/lib/get-server-token";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AccountClient from "@/components/store/account-client";
import type { Metadata } from "next";
import { serializeOrder } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const rawOrders = await db.order.findMany({
    where: { userId: token.id },
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const orders = rawOrders.map((order) => serializeOrder(order));

  return <AccountClient user={token} orders={orders} />;
}
