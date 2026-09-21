import CartClient from "@/components/store/cart-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sepetim",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
