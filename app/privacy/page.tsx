import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'privacy | Göçmen Kırtasiye',
  alternates: { canonical: SITE_URL + '/privacy' },
};

export default function StaticInfoPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f1] px-4 py-8 text-[#171717] md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-4">
          <a href="/" className="group" aria-label="Göçmen Kırtasiye ana sayfa">
            <p className="text-lg font-black uppercase tracking-[0.18em] text-[#171717]">Göçmen</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#b8973e]">Kırtasiye</p>
          </a>
          <a href="/" className="rounded-full border border-[#ded5c3] bg-white/70 px-4 py-2 text-xs font-bold text-zinc-600 transition hover:border-[#b8973e] hover:text-[#171717]">Ana sayfaya dön <span aria-hidden="true">→</span></a>
        </nav>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-[#171717] px-6 py-12 text-white shadow-[0_30px_70px_-40px_rgba(23,23,23,0.85)] md:px-14 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#b8973e]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d6b85a]">Göçmen Kırtasiye · Bilgi Merkezi</p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">Gizlilik</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">Bilgileriniz bizim için değerlidir</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="premium-card rounded-3xl border border-[#e8e1d3] bg-white p-6">
            <p className="text-xs font-black tracking-[0.2em] text-[#b8973e]">01</p>
            <h2 className="mt-8 text-lg font-black">Şeffaf bilgi</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">İhtiyacınız olan bilgileri sade ve anlaşılır bir deneyimle sunuyoruz.</p>
          </article>
          <article className="premium-card rounded-3xl border border-[#e8e1d3] bg-white p-6">
            <p className="text-xs font-black tracking-[0.2em] text-[#b8973e]">02</p>
            <h2 className="mt-8 text-lg font-black">Özenli hizmet</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">1993’ten beri kırtasiye alışverişini daha kolay ve keyifli hale getiriyoruz.</p>
          </article>
          <article className="premium-card rounded-3xl border border-[#e8e1d3] bg-white p-6">
            <p className="text-xs font-black tracking-[0.2em] text-[#b8973e]">03</p>
            <h2 className="mt-8 text-lg font-black">Yanınızdayız</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Sorularınız olduğunda doğru kanaldan hızlıca destek alabilirsiniz.</p>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-[#e8e1d3] bg-white p-6 shadow-[0_18px_50px_-36px_rgba(23,23,23,0.5)] md:p-10">
          <p className="max-w-3xl text-base leading-8 text-zinc-600">Göçmen Kırtasiye müşteri bilgilendirme sayfası. Detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>
        </section>
      </div>
    </main>
  );
}
