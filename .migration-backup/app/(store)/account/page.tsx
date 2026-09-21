import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AccountClient from "@/components/store/account-client";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AccountClient user={session.user} orders={orders} />;
}
