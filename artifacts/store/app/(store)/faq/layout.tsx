import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular | Göçmen Perde",
  description:
    "Göçmen Perde hakkında sık sorulan sorular — sipariş, ödeme, kargo ve ürün bilgileri.",
  alternates: { canonical: "https://www.gocmenperde.com.tr/faq" },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}