import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();
  return <div className="max-w-3xl mx-auto px-4 py-10" />;
}
