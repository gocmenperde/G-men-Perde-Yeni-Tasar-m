import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { catalogDb } from "@/lib/db";

export const revalidate = false;
export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Ürün Barkodu | Göçmen Perde",
  robots: { index: false, follow: true },
};

/**
 * Barkod rotası tarayıcı ve eski bağlantılar için giriş noktasıdır.
 * Ayrı bir ürün kopyası üretmez; tek ürün URL'sine kalıcı olarak yönlendirir.
 */
export default async function BarcodePage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  const product = await catalogDb.product.findFirst({
    where: {
      OR: [{ barcode }, { sku: barcode }],
      isActive: true,
    },
    select: { slug: true },
  });

  if (!product) notFound();
  permanentRedirect(`/products/${product.slug}`);
}