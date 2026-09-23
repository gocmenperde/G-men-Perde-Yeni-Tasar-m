import { db } from "@/lib/db";
import type { Metadata } from "next";
import PremiumAdminClient from "@/components/admin/premium-admin-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Premium Üyelik" };

export default async function AdminPremiumPage() {
  const [settings, activeMembers, totalMembers] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "global" } }),
    db.user.count({ where: { premiumUntil: { gt: new Date() } } }),
    db.premiumMembership.count({ where: { status: "ACTIVE" } }),
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