import { db } from "@/lib/db";
import SettingsClient from "@/components/admin/settings-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Site Ayarları" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  let settings: any = null;
  try {
    settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: "global" } });
    }
  } catch {}

  return <SettingsClient initialSettings={settings} initialTab={searchParams?.tab} />;
}
