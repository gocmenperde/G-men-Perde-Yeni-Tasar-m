import { db } from "@/lib/db";
import AdminCouponsClient from "@/components/admin/coupons-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Kuponlar" };

export default async function AdminCouponsPage() {
  const [rawCoupons, categories, brands, products] = await Promise.all([
    db.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.product.findMany({ where: { isActive: true }, select: { id: true, name: true, price: true }, orderBy: { name: "asc" } }),
  ]);
  const coupons = rawCoupons.map((c: any) => ({
    ...c,
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
    maxOrderAmount: c.maxOrderAmount ? Number(c.maxOrderAmount) : null,
    value: Number(c.value),
    buyAmount: c.buyAmount == null ? null : Number(c.buyAmount),
    payAmount: c.payAmount == null ? null : Number(c.payAmount),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() ?? null,
  }));
  return (
    <AdminCouponsClient
      coupons={coupons}
      categories={categories}
      brands={brands}
      products={products.map((product) => ({ ...product, price: Number(product.price) }))}
    />
  );
}
