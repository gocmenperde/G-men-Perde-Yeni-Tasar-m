import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'Online Kırtasiye | Göçmen Kırtasiye',
  description: 'Türkiye geneline online kırtasiye, okul, ofis ve sanat malzemeleri satışı.',
  keywords: generateKeywords(),
  alternates: { canonical: `${SITE_URL}/kirtasiye` },
};

export default function StationeryLandingPage() {
  return <HomePage />;
}
