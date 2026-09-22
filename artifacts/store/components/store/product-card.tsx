"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Check, Eye, GitCompareArrows, Heart, ShoppingCart, Star, Truck } from "lucide-react";
import toast from "react-hot-toast";
import ProductImage from "@/components/store/product-image";
import { useCartStore } from "@/lib/store/cart";
import { useComparisonStore } from "@/lib/store/comparison";
import { useWishlistStore } from "@/lib/store/wishlist";
import { getCurtainMeasurementRequirements } from "@/lib/curtain-measurements";

const QuickViewModal = dynamic(() => import("@/components/store/quick-view-modal"), { ssr: false });

function money(value: unknown) {
  return `₺${Number(value || 0).toLocaleString("tr-TR")}`;
}

export default function ProductCard({
  product,
  listView = false,
  priority = false,
}: {
  product: any;
  listView?: boolean;
  priority?: boolean;
}) {
  const router = useRouter();
  const [quickView, setQuickView] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showHoverImage, setShowHoverImage] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlistStore();
  const { add: addComparison, remove: removeComparison, has: hasComparison } = useComparisonStore();
  const isWished = hasWishlist(product.id);
  const isCompared = hasComparison(product.id);
  const measurementRequirements = getCurtainMeasurementRequirements(product);
  const needsMeasurement = measurementRequirements.requiresWidth
    || measurementRequirements.requiresHeight
    || measurementRequirements.requiresPile;
  const href = `/products/${product.slug}`;
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : 0;
  const rating = product.reviews?.length
    ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
    : null;
  const isNew = product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 10 * 24 * 60 * 60 * 1000;

  const stop = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleAdd = useCallback((event: MouseEvent) => {
    stop(event);
    if (!product.stock || adding) return;
    if (needsMeasurement) {
      router.push(href);
      return;
    }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? "",
      quantity: 1,
    });
    setAdding(true);
    window.setTimeout(() => setAdding(false), 1500);
    toast.success("Sepete eklendi.", { style: { fontSize: "13px" } });
  }, [addItem, adding, href, needsMeasurement, product, router]);

  const handleWishlist = useCallback((event: MouseEvent) => {
    stop(event);
    toggleWishlist(product.id, product.name, Number(product.price), product.images?.[0], product.slug);
    if (!isWished) toast.success("Favorilere eklendi.", { style: { fontSize: "13px" } });
  }, [isWished, product, toggleWishlist]);

  const handleCompare = useCallback((event: MouseEvent) => {
    stop(event);
    if (isCompared) {
      removeComparison(product.id);
      return;
    }
    const ok = addComparison({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      image: product.images?.[0],
      brand: product.brand?.name,
      category: product.category?.name ?? product.category,
      stock: product.stock,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
    });
    if (!ok) toast.error("En fazla 3 ürün karşılaştırabilirsiniz.");
    else toast.success("Karşılaştırmaya eklendi.", { duration: 1500 });
  }, [addComparison, isCompared, product, removeComparison]);

  const openProduct = () => router.push(href);
  const productEvents = {
    onClick: openProduct,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProduct();
      }
    },
  };

  if (listView) {
    return (
      <div {...productEvents} role="link" tabIndex={0} className="group flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--gold-light)]">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
          <ProductImage src={product.images} alt={product.name} fill sizes="96px" cdnWidth={320} className="object-cover" priority={priority} fallbackLabel="Görsel yok" />
          {discount > 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-[#D96C54] px-1.5 py-1 text-[9px] font-extrabold text-white">-{discount}%</span>}
        </div>
        <div className="min-w-0 flex-1 py-1">
          {product.brand && <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--gold)]">{product.brand.name}</p>}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--gold)]">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <strong className="text-base text-[var(--navy)]">{money(product.price)}</strong>
            {product.comparePrice && <del className="text-xs text-[var(--ink-muted)]">{money(product.comparePrice)}</del>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col justify-center gap-1.5">
          <button type="button" onClick={handleWishlist} aria-label="Favorilere ekle" className={`touch-target rounded-xl border p-2 ${isWished ? "border-[#D96C54] bg-[#D96C54] text-white" : "border-[var(--line)] text-[var(--ink-muted)] hover:text-[#D96C54]"}`}>
            <Heart className={`h-3.5 w-3.5 ${isWished ? "fill-current" : ""}`} />
          </button>
           <button type="button" onClick={handleAdd} disabled={!product.stock} aria-label={needsMeasurement ? "Ölçü seç" : "Sepete ekle"} className={`touch-target rounded-xl border p-2 ${adding ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-[var(--navy)] bg-[var(--navy)] text-white disabled:border-[var(--line)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--ink-muted)]"}`}>
             {adding ? <Check className="h-3.5 w-3.5" /> : needsMeasurement ? <span className="text-[10px] font-bold">ÖLÇÜ</span> : <ShoppingCart className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article {...productEvents} onMouseEnter={() => setShowHoverImage(true)} onFocus={() => setShowHoverImage(true)} role="link" tabIndex={0} className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--gold-light)] hover:shadow-[0_16px_35px_rgba(45,55,52,.12)] sm:rounded-[1.35rem]">
      <div className="relative aspect-[.88/1] overflow-hidden bg-[var(--surface-muted)]">
        <ProductImage src={product.images} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" cdnWidth={640} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" priority={priority} fallbackLabel="Görsel hazırlanıyor" />
        {showHoverImage && product.images?.[1] && <ProductImage src={product.images[1]} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" cdnWidth={640} className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {discount > 0 && <span className="rounded-md bg-[#D96C54] px-2 py-1 text-[10px] font-extrabold text-white">-{discount}%</span>}
          {discount === 0 && isNew && <span className="rounded-md bg-[var(--navy)] px-2 py-1 text-[10px] font-extrabold text-white">Yeni</span>}
          {product.stock === 0 && <span className="rounded-md bg-[#243238]/90 px-2 py-1 text-[10px] font-extrabold text-white">Tükendi</span>}
          {product.stock > 0 && product.stock <= 3 && <span className="rounded-md bg-[#B65349] px-2 py-1 text-[10px] font-extrabold text-white">Son {product.stock}</span>}
        </div>
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <button type="button" onClick={handleWishlist} aria-label="Favorilere ekle" className={`touch-target rounded-xl border p-2 shadow-sm backdrop-blur-sm transition-opacity ${isWished ? "border-[#D96C54] bg-[#D96C54] text-white" : "border-white/70 bg-[#FBF8F2]/90 text-[var(--ink-muted)] opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}>
            <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
          </button>
          <button type="button" onClick={(event) => { stop(event); setQuickView(true); }} aria-label="Hızlı önizleme" className="touch-target rounded-xl border border-white/70 bg-[#FBF8F2]/90 p-2 text-[var(--ink-muted)] opacity-100 shadow-sm backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleCompare} aria-label="Karşılaştır" className={`touch-target rounded-xl border p-2 shadow-sm backdrop-blur-sm ${isCompared ? "border-[var(--gold)] bg-[var(--gold)] text-white" : "border-white/70 bg-[#FBF8F2]/90 text-[var(--ink-muted)] opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}>
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {product.brand ? <p className="mb-1.5 truncate text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--gold)]">{product.brand.name}</p> : <div className="mb-1.5 h-3" />}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--gold)]">{product.name}</h3>
        {rating && <div className="mt-2 flex items-center gap-1" aria-label={`${rating.toFixed(1)} puan`}>
          <span className="flex text-[#C28A3D]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className={`h-2.5 w-2.5 ${item <= Math.round(rating) ? "fill-current" : "text-[var(--line)]"}`} />)}</span>
          <span className="text-[10px] text-[var(--ink-muted)]">({product.reviews.length})</span>
        </div>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.comparePrice && <del className="block text-[11px] leading-none text-[var(--ink-muted)]">{money(product.comparePrice)}</del>}
            <strong className={`text-[17px] tracking-tight ${product.comparePrice ? "text-[#B65349]" : "text-[var(--navy)]"}`}>{money(product.price)}</strong>
          </div>
          <span className={`text-[10px] font-bold ${product.stock > 0 ? "text-[var(--success)]" : "text-[var(--ink-muted)]"}`}>{product.stock > 0 ? "Stokta" : "Tükendi"}</span>
        </div>
        {product.stock > 0 && <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1.5 text-[10px] font-bold text-[var(--ink-muted)]"><Truck className="h-3 w-3 text-[var(--gold)]" /> Hızlı teslimat</div>}
         <button type="button" onClick={handleAdd} disabled={!product.stock} className={`mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold transition-colors ${adding ? "bg-[var(--success)] text-white" : "bg-[var(--navy)] text-white hover:bg-[var(--gold)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--ink-muted)]"}`}>
           {adding ? <><Check className="h-3.5 w-3.5" /> Eklendi</> : product.stock > 0 ? needsMeasurement ? <><Eye className="h-3.5 w-3.5" /> Ölçü seç</> : <><ShoppingCart className="h-3.5 w-3.5" /> Sepete ekle</> : "Tükendi"}
        </button>
      </div>
      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </article>
  );
}