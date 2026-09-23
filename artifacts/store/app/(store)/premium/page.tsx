import type { Metadata } from "next";
import PremiumClient from "@/components/store/premium-client";

export const metadata: Metadata = {
  title: "Göçmen Premium",
  description: "Göçmen Premium üyeliğin avantajlarını keşfedin.",
};

export default function PremiumPage() {
  return <PremiumClient />;
}