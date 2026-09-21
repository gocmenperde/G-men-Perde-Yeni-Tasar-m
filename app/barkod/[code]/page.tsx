import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Barkod ${code} | Göçmen Kırtasiye`,
    description: `${code} barkodlu kırtasiye ürününü ve benzer ürünleri Göçmen Kırtasiye'de keşfedin.`,
    keywords: generateKeywords({ barcode: code }),
    alternates: { canonical: `${SITE_URL}/barkod/${code}` },
  };
}

export default function BarcodeLandingPage() {
  return <HomePage />;
}
