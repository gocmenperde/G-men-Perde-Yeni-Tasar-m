import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./product-card";

export default function FeaturedProducts({ products }: { products: any[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-[var(--surface)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <span className="section-label">Göçmen seçkisi</span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-tight text-[var(--navy)] sm:text-5xl">Masada yer açın.</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-muted)]">Çok sevilen, stokta olan ve günlük kullanıma hazır ürünler.</p>
          </div>
          <Link href="/products?isFeatured=true" className="group hidden items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 text-xs font-extrabold text-[var(--navy)] transition-colors hover:border-[var(--gold-light)] hover:bg-[var(--gold-pale)] sm:inline-flex">
            Seçkinin tamamı <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
        </div>
        <Link href="/products?isFeatured=true" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--navy)] sm:hidden">
          <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" /> Tüm seçkiyi gör <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}