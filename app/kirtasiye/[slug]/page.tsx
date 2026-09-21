import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = slug.replace(/-/g, ' ');
  return {
    title: `${city} Kırtasiye | Göçmen Kırtasiye`,
    description: `${city} için kırtasiye, okul, ofis ve sanat malzemelerini Göçmen Kırtasiye'den online sipariş verin.`,
    keywords: generateKeywords({ city }),
    alternates: { canonical: `${SITE_URL}/kirtasiye/${slug}` },
  };
}

export default function CityLandingPage() {
  return <HomePage />;
}
