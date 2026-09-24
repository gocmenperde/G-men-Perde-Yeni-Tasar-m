import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clock3,
  MessageCircle,
  Ruler,
  Scissors,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "İade Politikası | Göçmen Perde",
  description:
    "Kişiye özel ölçü ve dikimle hazırlanan Göçmen Perde ürünlerinde iade koşulları ve sipariş değişikliği.",
  alternates: {
    canonical: "https://www.gocmenperde.com.tr/iade-politikasi",
  },
  openGraph: {
    type: "website",
    title: "İade Politikası | Göçmen Perde",
    description:
      "Kişiye özel hazırlanan perde siparişlerinde iade koşulları ve ürün desteği hakkında açık bilgiler.",
    url: "https://www.gocmenperde.com.tr/iade-politikasi",
    siteName: "Göçmen Perde",
  },
  twitter: {
    card: "summary_large_image",
    title: "İade Politikası | Göçmen Perde",
    description:
      "Kişiye özel hazırlanan perde siparişlerinde iade koşulları ve ürün desteği.",
  },
};

const highlights = [
  {
    icon: Ruler,
    title: "Size göre ölçü",
    description: "Siparişinizde belirttiğiniz ölçüler ve kullanım ihtiyacınız dikkate alınır.",
  },
  {
    icon: Scissors,
    title: "Özenli hazırlık",
    description: "Kumaş, model ve dikim tercihleri siparişinize göre işleme alınır.",
  },
  {
    icon: Sparkles,
    title: "Evinize özel",
    description: "Her sipariş, yaşam alanınıza uyum sağlaması için kişiye özel hazırlanır.",
  },
];

const noReturnReasons = [
  "Siparişten sonra fikir değişikliği veya ürünü artık istememe",
  "Siparişte belirtilen ölçü, renk, kumaş ya da model tercihinden vazgeçilmesi",
  "Ürünün, müşteri tarafından bildirilen ölçülere uygun olduğu hâlde mekâna uymaması",
  "Dekorasyon veya kullanım planının sonradan değişmesi",
];

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav
          aria-label="Sayfa konumu"
          className="mb-7 flex items-center gap-1.5 text-sm text-zinc-400"
        >
          <Link href="/" className="transition-colors hover:text-[#B8973E]">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-zinc-700">İade Politikası</span>
        </nav>

        <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17282C] via-[#203B3F] to-[#17282C] p-7 text-white shadow-xl shadow-[#17282C]/10 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5B96F]/25 bg-white/5 text-[#E5B96F]">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#E5B96F]">
              Göçmen Perde · 1993&apos;ten beri
            </p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">
              Her sipariş, evinize göre hazırlanır.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#D5DEDA] sm:text-base">
              Ürünlerimiz ölçü, kumaş, model ve dikim tercihlerinize göre özenle
              hazırlanır. Bu kişiye özel üretim süreci nedeniyle, yalnızca
              fikir değişikliği gibi kişisel tercihlere dayanan iade taleplerini
              kabul edemiyoruz.
            </p>
          </div>
        </header>

        <section
          aria-label="Kişiye özel hazırlık süreci"
          className="mt-5 grid gap-3 sm:grid-cols-3"
        >
          {highlights.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E8E0D5] bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#A78337]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-extrabold text-zinc-900">{title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                {description}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-3xl border border-[#E8E0D5] bg-white p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#A78337]">
                <Scissors className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-black text-zinc-900">
                Neden kişiye özel ürünlerde iade kabul edemiyoruz?
              </h2>
            </div>
            <p className="text-sm leading-7 text-zinc-600">
              Perdeniz, siparişinizde paylaştığınız ölçülere ve seçtiğiniz
              ürün özelliklerine göre hazırlanır. Kumaş kesildikten ve dikim
              süreci başladıktan sonra ürün, başka bir ev veya sipariş için
              standart bir ürün gibi yeniden değerlendirilemez. Bu nedenle
              siparişe özel hazırlanmış ürünlerde kişisel tercihin değişmesi
              sebebiyle iade ya da değişim yapamıyoruz.
            </p>
            <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-5">
              <h3 className="mb-3 text-sm font-extrabold text-zinc-900">
                Kişisel tercihe dayalı iade kapsamına girmeyen durumlar
              </h3>
              <ul className="space-y-2.5">
                {noReturnReasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2.5 text-sm leading-6 text-zinc-600"
                  >
                    <Check
                      className="mt-1 h-4 w-4 flex-shrink-0 text-[#A78337]"
                      aria-hidden="true"
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E8E0D5] bg-white p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-black text-zinc-900">
                Sipariş bilgileriniz önemli
              </h2>
            </div>
            <p className="text-sm leading-7 text-zinc-600">
              Ölçü, renk, kumaş ve model seçiminizi siparişi tamamlamadan önce
              dikkatlice kontrol etmenizi rica ederiz. Bir düzeltme ihtiyacı
              fark ederseniz mümkün olan en kısa sürede bizimle iletişime
              geçin. Üretim başlamadan önce değişiklik talebinizi imkânlar
              dâhilinde değerlendirmeye çalışırız; kumaş kesimi veya dikim
              başladıktan sonra değişiklik yapmak mümkün olmayabilir.
            </p>
            <Link
              href="/measure-guide"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#8D6E2F] underline decoration-[#D8C28F] underline-offset-4 transition-colors hover:text-zinc-900"
            >
              Ölçü rehberini inceleyin
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>

        <section className="mt-5 flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#17282C] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-3">
            <MessageCircle
              className="mt-1 h-5 w-5 flex-shrink-0 text-[#E5B96F]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-black">Siparişinizle ilgili desteğe mi ihtiyacınız var?</h2>
              <p className="mt-1 text-sm leading-6 text-[#B7C5C1]">
                Sipariş numaranızı paylaşın; ekibimiz size yardımcı olsun.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-xl bg-[#E5B96F] px-5 py-3 text-sm font-extrabold text-[#17282C] transition-colors hover:bg-[#F0C986] sm:w-auto"
          >
            İletişime geçin
          </Link>
        </section>

        <p className="mt-5 text-center text-xs text-zinc-400">
          Son güncelleme: 24 Eylül 2026
        </p>
      </div>
    </main>
  );
}