import type { Metadata } from "next";
import TrendyolTabs from "@/components/admin/trendyol-tabs";

export const metadata: Metadata = { title: "Admin — Trendyol" };

export default async function TrendyolPage() {
  return <TrendyolTabs />;
}
