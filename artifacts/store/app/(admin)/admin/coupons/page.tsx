import { db } from "@/lib/db";
import AdminCouponsClient from "@/components/admin/coupons-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Kuponlar" };

export default async function AdminCouponsPage() {
  const rawCoupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons = rawCoupons.map((c: any) => ({
    ...c,
    value: Number(c.value),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() ?? null,
  }));
  return <AdminCouponsClient coupons={coupons} />;
}
