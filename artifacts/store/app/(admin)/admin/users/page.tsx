import { db } from "@/lib/db";
import AdminUsersClient from "@/components/admin/users-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Kullanıcılar" };

export default async function AdminUsersPage() {
  const rawUsers = await db.user.findMany({
    include: {
      _count: { select: { orders: true } },
      addresses: { orderBy: { isDefault: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const spendData = await db.order.groupBy({
    by: ["userId"],
    where: { status: { in: ["DELIVERED", "PROCESSING", "SHIPPED", "PAID"] } },
    _sum: { total: true },
    _max: { createdAt: true },
  });

  const spendMap = new Map(
    spendData.map((s) => [s.userId, { spend: Number(s._sum.total ?? 0), lastOrder: s._max.createdAt }]),
  );

  const users = rawUsers.map((u: any) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    emailVerified: u.emailVerified?.toISOString() ?? null,
    totalSpent: spendMap.get(u.id)?.spend ?? 0,
    lastOrderAt: spendMap.get(u.id)?.lastOrder?.toISOString() ?? null,
  }));

  return <AdminUsersClient users={users} />;
}
