import { redirect } from "next/navigation";
import { getServerToken } from "@/lib/get-server-token";
import CheckoutClient from "@/components/store/checkout-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Güvenli Ödeme | Göçmen Kırtasiye",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const token = await getServerToken();
  if (!token) redirect("/login?callbackUrl=/checkout");
  return <CheckoutClient />;
}
