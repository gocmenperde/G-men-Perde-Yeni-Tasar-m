import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Layers3, Ruler, Scissors, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Kalite ve Özen | Göçmen Perde",
  description:
    "Göçmen Perde koleksiyonunu kumaş dokusu, kullanım alanı ve işçilik detaylarını gözeterek özenle oluşturur.",
  alternates: { canonical: "https://www.gocmenperde.com.tr/kalite" },
};

const qualityDetails = [
  {
    icon: Layers3,
    title: "Özenle seçilen dokular",
    description:
      "Tül, fon, stor, zebra ve plise seçeneklerini farklı yaşam alanlarının ihtiyaçlarına göre bir araya getiriyoruz.",
  },
  {
    icon: Ruler,
    title: "İhtiyaca uygun ölçüler",
    description:
      "Ürün türüne göre hazır ölçü ve özel ölçü seçeneklerini inceleyebilir, ölçü rehberimizden yararlanabilirsiniz.",
  },
  {
    icon: Scissors,
    title: "Dikim ve uygulama deneyimi",
    description:
      "1993'ten bu yana edindiğimiz perde deneyimini, ölçü, dikim ve montaj desteğiyle buluşturuyoruz.",
  },
];

export default function QualityPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="mx-auto max-w-4xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-zinc-400">
          <Link href="/" className="transition-colors hover:text-[#B8973E]">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-zinc-700">Kalite ve Özen</span>
        </nav>

        <section className="mb-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-7 w-7 text-[#D4AF5A]" aria-hidden="true" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF5A]">
            Göçmen Perde · 1993&apos;ten beri
          </p>
          <h1 className="mb-4 text-3xl font-black text-white sm:text-4xl">
            Kaliteye ve özenli seçime önem veriyoruz
          </h1>
          <p className="mx-auto max-w-2xl leading-relaxed text-zinc-300">
            Perde seçiminde kumaş dokusunu, kullanım alanını ve işçilik
            detaylarını birlikte düşünüyoruz. Evinize uygun seçenekleri
            keşfederken ihtiyaç duyduğunuz bilgiyi açık ve anlaşılır biçimde
            sunmayı amaçlıyoruz.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {qualityDetails.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E8E0D5] bg-white p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#B8973E]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mb-2 font-black text-zinc-900">{title}</h2>
              <p className="text-sm leading-relaxed text-zinc-500">
                {description}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 font-bold text-white transition-colors hover:bg-[#B8973E]"
          >
            Koleksiyonu keşfet
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-[#E8E0D5] bg-white px-6 py-3 font-bold text-zinc-700 transition-colors hover:border-[#D4AF5A]"
          >
            Ürün seçimi için bize ulaşın
          </Link>
        </div>
      </div>
    </main>
  );
}