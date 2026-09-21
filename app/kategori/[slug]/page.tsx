import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = `${slug.replace(/-/g, ' ')} Kategorisi | Göçmen Kırtasiye`;
  return {
    title,
    description: `${slug.replace(/-/g, ' ')} ürünlerini Göçmen Kırtasiye'de keşfedin. Bursa'dan Türkiye geneline hızlı kırtasiye alışverişi.`,
    keywords: generateKeywords({ categoryName: slug.replace(/-/g, ' ') }),
    alternates: { canonical: `${SITE_URL}/kategori/${slug}` },
  };
}

export default function CategoryLandingPage() {
  return <HomePage />;
}
