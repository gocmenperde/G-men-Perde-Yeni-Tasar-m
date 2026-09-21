import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import ProductCard from "./product-card";

export default function NewArrivals({ products }: { products: any[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <span className="section-label">Rafa yeni geldi</span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-tight text-[var(--navy)] sm:text-5xl">Taze keşifler.</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-muted)]">Stoğa yeni giren ürünlerle çalışma alanına küçük bir yenilik kat.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[11px] font-bold text-[var(--ink-muted)] sm:flex">
            <Clock className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden="true" /> Son eklenenler
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
        </div>
        <Link href="/products?sort=newest" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--navy)]">
          Tüm yeni ürünler <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}