import { db } from "@/lib/db";
import type { Metadata } from "next";
import PremiumAdminClient from "@/components/admin/premium-admin-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Premium Üyelik" };

async function safeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[Admin Premium] ${label} verisi yüklenemedi`, error);
    return fallback;
  }
}

export default async function AdminPremiumPage() {
  const [settings, activeMembers, totalMembers] = await Promise.all([
    safeQuery("Premium ayarları", () => db.siteSettings.findUnique({ where: { id: "global" } }), null),
    safeQuery("aktif Premium üyeleri", () => db.user.count({ where: { premiumUntil: { gt: new Date() } } }), 0),
    safeQuery("Premium ödeme sayısı", () => db.premiumMembership.count({ where: { status: "ACTIVE" } }), 0),
  ]);

  return (
    <PremiumAdminClient
      initialSettings={{
        premiumEnabled: settings?.premiumEnabled !== false,
        premiumPrice: Number(settings?.premiumPrice ?? 79),
        premiumDiscountType: settings?.premiumDiscountType ?? "PERCENTAGE",
        premiumDiscountValue: Number(settings?.premiumDiscountValue ?? 10),
        premiumFreeShipping: settings?.premiumFreeShipping !== false,
        premiumLogoText: settings?.premiumLogoText ?? "Göçmen Premium Üyesi",
      }}
      stats={{ activeMembers, totalMembers }}
    />
  );
}