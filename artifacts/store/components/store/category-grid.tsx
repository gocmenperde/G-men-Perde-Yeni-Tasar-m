import Link from "next/link";
import {
  ArrowUpRight,
  House,
  Layers3,
  PanelTop,
  Ruler,
  Sparkles,
  Sun,
} from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { getCategoryImage, getCuratedCategoryImage } from "@/lib/taxonomy-images";

const categoryStyles = [
  { icon: PanelTop, tone: "bg-[#B8973E]" },
  { icon: Sun, tone: "bg-[#C69C42]" },
  { icon: Layers3, tone: "bg-[#6F7C70]" },
  { icon: House, tone: "bg-[#8A6C55]" },
  { icon: Sparkles, tone: "bg-[#A67C52]" },
  { icon: Ruler, tone: "bg-[#496A72]" },
];

const hiddenSlugs = new Set(["belirtilmedi", "deneme", "ihtiyac", "mesh", "min", "kitap"]);

export default function CategoryGrid({ categories }: { categories: any[] }) {
  const visible = categories.filter((category) => !category.parentId && !hiddenSlugs.has(category.slug)).slice(0, 6);
  if (!visible.length) return null;

  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <span className="section-label">Yaşam alanınıza göre seçin</span>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-none tracking-tight text-[var(--navy)] sm:text-5xl">Perdede aradığınız her şey.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-muted)]">Tül, fon, stor, zebra ve plise perde seçeneklerini kullanım alanınıza göre keşfedin.</p>
          </div>
          <Link href="/products" className="group inline-flex items-center gap-2 text-sm font-extrabold text-[var(--navy)] underline decoration-[var(--gold-light)] decoration-2 underline-offset-4">
            Tüm kategoriler <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {visible.map((category, index) => {
            const Icon = categoryStyles[index % categoryStyles.length].icon;
            const tone = categoryStyles[index % categoryStyles.length].tone;
            const featured = index === 0;
            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className={`group relative isolate overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
              >
                <div className={`relative ${featured ? "aspect-[1.25/1] md:aspect-auto md:h-full md:min-h-[350px]" : "aspect-[1.05/1]"}`}>
                  <ProductImage
                    src={getCategoryImage(category)}
                    fallbackSrc={category.image ? getCuratedCategoryImage(category.slug) : undefined}
                    alt={category.name}
                    fill
                    sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    fallbackLabel="Kategori görseli yok"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17282C]/90 via-[#17282C]/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl text-[#FFF8EE] ${tone}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <h3 className={`font-display font-bold leading-none text-[#FFF8EE] ${featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>{category.name}</h3>
                        <p className="mt-2 text-[11px] font-semibold text-[#D9E0DB]">{category._count?.products ?? 0} ürün</p>
                      </div>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-colors group-hover:bg-[#E5B96F] group-hover:text-[#243B43]">
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}