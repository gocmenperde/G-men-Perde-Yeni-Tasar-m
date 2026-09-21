import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const productName = slug.replace(/-/g, ' ');
  return {
    title: `${productName} | Göçmen Kırtasiye`,
    description: `${productName} ve benzer kırtasiye ürünlerini Göçmen Kırtasiye'de keşfedin.`,
    keywords: generateKeywords({ productName }),
    alternates: { canonical: `${SITE_URL}/products/${slug}` },
  };
}

export default function ProductLandingPage() {
  return <HomePage />;
}
