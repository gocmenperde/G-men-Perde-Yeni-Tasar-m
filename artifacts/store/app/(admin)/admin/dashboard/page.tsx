import { db } from "@/lib/db";
import AdminDashboardClient from "@/components/admin/dashboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const failedSections = new Set<string>();
  const safeQuery = async <T,>(
    label: string,
    query: () => Promise<T>,
    fallback: T,
  ): Promise<T> => {
    try {
      return await query();
    } catch (error) {
      failedSections.add(label);
      console.error(`[Admin Dashboard] ${label} verisi yüklenemedi`, error);
      return fallback;
    }
  };

  const [totalProducts, totalOrders, totalUsers, categoryCount, brandCount, recentOrders, orderStats] =
    await Promise.all([
      safeQuery("ürün toplamı", () => db.product.count(), 0),
      safeQuery("sipariş toplamı", () => db.order.count(), 0),
      safeQuery("kullanıcı toplamı", () => db.user.count(), 0),
      safeQuery("kategori toplamı", () => db.category.count(), 0),
      safeQuery("marka toplamı", () => db.brand.count(), 0),
      safeQuery("son siparişler", () => db.order.findMany({
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }), []),
      safeQuery("sipariş istatistikleri", () => db.order.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { total: true },
      }), []),
    ]);

  const [bkmTotal, bkmOutOfStock, bkmLastSynced, bkmRecentlyUpdated] = await Promise.all([
    safeQuery("BKM ürün toplamı", () => db.product.count({ where: { id: { startsWith: "bkm_" } } }), 0),
    safeQuery("BKM stok bilgisi", () => db.product.count({ where: { id: { startsWith: "bkm_" }, stock: 0 } }), 0),
    safeQuery<any>("BKM son senkronizasyonu", () => db.product.findFirst({
      where: { id: { startsWith: "bkm_" } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }), null),
    safeQuery("BKM güncelleme bilgisi", () => db.product.count({
      where: {
        id: { startsWith: "bkm_" },
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }), 0),
  ]);

  const totalRevenue = await safeQuery<any>("toplam gelir", () => db.order.aggregate({
    where: { status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] } },
    _sum: { total: true },
  }), { _sum: { total: null } });

  const topProductsRaw = await safeQuery("en çok satan ürünler", () => db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  }), []);

  const topProductIds = topProductsRaw.map((p) => p.productId);
  const topProductDetails = await safeQuery<any[]>("en çok satan ürün detayları", () => db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true },
  }), []);

  const topProducts = topProductsRaw.map((p) => {
    const detail = topProductDetails.find((d) => d.id === p.productId);
    return {
      name: detail ? (detail.name.length > 28 ? detail.name.slice(0, 28) + "…" : detail.name) : p.productId.slice(-8),
      qty: p._sum.quantity ?? 0,
      revenue: (p._sum.quantity ?? 0) * Number(detail?.price ?? 0),
    };
  }).filter((p) => p.qty > 0);

  const lowStockProducts = await safeQuery("düşük stok ürünleri", () => db.product.findMany({
    where: { stock: { gt: 0, lte: 5 }, isActive: true },
    select: { id: true, name: true, stock: true, slug: true },
    orderBy: { stock: "asc" },
    take: 10,
  }), []);

  const last7Days = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      const result = await safeQuery<any>(`günlük siparişler ${i + 1}`, () => db.order.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { total: true },
        _count: { _all: true },
      }), { _sum: { total: null }, _count: { _all: 0 } });

      return {
        date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        total: Number(result._sum.total ?? 0),
        orders: result._count._all,
      };
    }),
  );

  const serializedRecentOrders = recentOrders.map((o: any) => ({
    ...o,
    total: Number(o.total),
    subtotal: Number(o.subtotal),
    discount: Number(o.discount ?? 0),
    shipping: Number(o.shipping ?? 0),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((item: any) => ({ ...item, price: Number(item.price) })),
  }));

  const serializedOrderStats = orderStats.map((s: any) => ({
    status: s.status,
    _count: s._count,
    _sum: { total: Number(s._sum?.total ?? 0) },
  }));

  return (
    <AdminDashboardClient
      topProducts={topProducts}
      stats={{
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
      }}
      recentOrders={serializedRecentOrders}
      chartData={last7Days.reverse()}
      orderStats={serializedOrderStats}
      categoryCount={categoryCount}
      brandCount={brandCount}
      lowStockProducts={lowStockProducts}
      dataWarning={
        ["ürün toplamı", "kategori toplamı", "marka toplamı"].some((label) => failedSections.has(label))
          ? "Bazı dashboard verileri yüklenemedi. Admin paneli açık; bağlantı düzeldiğinde tekrar yenileyin."
          : null
      }
      syncStats={{
        bkmTotal,
        bkmOutOfStock,
        bkmLastSyncedAt: bkmLastSynced?.updatedAt?.toISOString() ?? null,
        bkmRecentlyUpdated,
      }}
    />
  );
}
