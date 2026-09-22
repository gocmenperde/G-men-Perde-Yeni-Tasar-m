import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Ruler, Scissors, ShieldCheck, Truck } from "lucide-react";
import MeasurementQuoteCalculator from "@/components/store/measurement-quote-calculator";
import { GOCMEN_MEASURE_GUIDE } from "@/data/gocmen-catalog";

export const metadata: Metadata = {
  title: "Perde Ölçü Rehberi ve Ücretsiz Teklif | Göçmen Perde",
  description: "Tül, fon, stor, zebra ve plise perde için doğru ölçü alma adımları. Ölçünüzü paylaşın, ücretsiz ürün ve montaj teklifi alın.",
  alternates: { canonical: "https://www.gocmenperde.com.tr/measure-guide" },
  openGraph: {
    title: "Perde Ölçü Rehberi ve Ücretsiz Teklif | Göçmen Perde",
    description: "Perde ölçünüzü doğru alın; ürün, kumaş ve montaj seçenekleri için ücretsiz destek alın.",
    type: "website",
  },
};

const STEPS = [
  { icon: Ruler, title: "Ölçünüzü alın", text: "Kornişten zemine kadar en ve boyu metre cinsinden not edin." },
  { icon: Scissors, title: "Modeli seçin", text: "Tül, fon, stor, zebra veya plise için kullanım amacınızı belirleyin." },
  { icon: ShieldCheck, title: "Birlikte netleştirelim", text: "Ekibimiz ölçüyü teyit eder; kumaş, dikim ve montajı birlikte planlar." },
];

export default function MeasureGuidePage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--ink-muted)]">
            <Link href="/" className="transition-colors hover:text-[var(--gold)]">Ana Sayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium text-[var(--ink)]">Ölçü Rehberi</span>
          </nav>
        </div>
      </div>

      <header className="bg-[var(--navy)] px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-[var(--gold-light)]">Özel ölçü perde danışmanlığı</p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Doğru ölçü, doğru perde ve daha hızlı teklif.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Ölçü alma adımlarını aşağıdan takip edin. Hazır olduğunuzda yaklaşık ölçünüzü paylaşın; perde türü, kumaş ve montaj seçeneklerini birlikte netleştirelim.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-10 grid gap-3 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold-pale)] text-[var(--gold)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-black text-white">{index + 1}</span>
              </div>
              <div>
                <h2 className="text-sm font-black text-[var(--navy)]">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
          <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold-pale)] text-[var(--gold)]">
                <Ruler className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--gold)]">Adım adım</p>
                <h2 className="text-xl font-black text-[var(--navy)]">{GOCMEN_MEASURE_GUIDE.title}</h2>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-[var(--ink-muted)] prose-headings:text-[var(--navy)] prose-strong:text-[var(--navy)] prose-li:my-1" dangerouslySetInnerHTML={{ __html: GOCMEN_MEASURE_GUIDE.contentHtml }} />
            {GOCMEN_MEASURE_GUIDE.images.map((image) => (
              <img key={image.url} src={image.url} alt={image.alt} loading="lazy" className="mt-6 max-h-[28rem] w-full rounded-2xl border border-[var(--line)] object-contain" />
            ))}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--gold-light)]/50 bg-[var(--gold-pale)]/45 p-4">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[var(--ink-muted)]"><strong className="text-[var(--navy)]">Bursa içi destek:</strong> Ölçünüzden emin değilseniz yaklaşık bilgileri gönderin; sipariş öncesi ekibimiz sizinle teyit için iletişime geçer.</p>
            </div>
          </article>

          <div className="lg:sticky lg:top-24">
            <MeasurementQuoteCalculator />
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center sm:p-7">
          <h2 className="text-lg font-black text-[var(--navy)]">Henüz hangi modeli istediğinize karar veremediniz mi?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">Odaya, ışık ihtiyacına ve pencerenize göre perde seçkilerini inceleyin; ürün sayfalarında ölçüye göre fiyat hesaplama seçeneklerini kullanın.</p>
          <Link href="/products" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--navy)] px-5 text-sm font-black text-white transition-colors hover:bg-[var(--gold)]">Perde modellerini incele</Link>
        </section>
      </main>
    </div>
  );
}