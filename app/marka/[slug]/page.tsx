import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = slug.replace(/-/g, ' ');
  return {
    title: `${brand} Ürünleri | Göçmen Kırtasiye`,
    description: `${brand} kırtasiye ürünlerini Göçmen Kırtasiye'de inceleyin. Uygun fiyatlı okul, ofis ve sanat malzemeleri.`,
    keywords: generateKeywords({ brandName: brand }),
    alternates: { canonical: `${SITE_URL}/marka/${slug}` },
  };
}

export default function BrandLandingPage() {
  return <HomePage />;
}
