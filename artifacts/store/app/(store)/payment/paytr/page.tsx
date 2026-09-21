import { redirect } from "next/navigation";
import { getServerToken } from "@/lib/get-server-token";
import PaytrFrameClient from "./paytr-frame-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme | Göçmen Kırtasiye",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaytrPaymentPage({ searchParams }: Props) {
  const token = await getServerToken();
  if (!token) redirect("/login?callbackUrl=/payment/paytr");

  const { orderId = "" } = await searchParams;
  if (!orderId) redirect("/cart");

  return <PaytrFrameClient orderId={orderId} />;
}
