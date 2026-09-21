import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'returns | Göçmen Kırtasiye',
  alternates: { canonical: SITE_URL + '/returns' },
};

export default function StaticInfoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold capitalize">returns</h1>
      <p className="mt-4 text-muted-foreground">
        Göçmen Kırtasiye müşteri bilgilendirme sayfası. Detaylı bilgi için bizimle iletişime geçebilirsiniz.
      </p>
    </main>
  );
}
