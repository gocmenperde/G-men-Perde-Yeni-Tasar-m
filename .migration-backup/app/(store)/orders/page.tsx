import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PROCESSING: { label: "İşleniyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  SHIPPED: { label: "Kargoda", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  DELIVERED: { label: "Teslim", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELED: { label: "İptal", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/orders");
  const orders = await db.order.findMany({ where: { userId: session.user.id }, include: { items: { include: { product: { select: { name: true, images: true } } }, take: 2 } }, orderBy: { createdAt: "desc" } });
  return <div className="max-w-3xl mx-auto px-4 py-10"><h1 className="text-3xl font-black dark:text-white mb-8">Siparişlerim</h1></div>;
}
