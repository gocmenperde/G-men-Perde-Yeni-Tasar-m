"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";
import ProductImage from "@/components/store/product-image";

export default function CartCrossSell({ cartProductIds }: { cartProductIds: string[] }) {
  const [products, setProducts] = useState<any[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products?take=8&sort=popular&includeTotal=false", {
          cache: "force-cache",
        });
        const data = await res.json();
        // Sepetteki ürünleri hariç tut
        const filtered = (data.data ?? []).filter(
          (p: any) => !cartProductIds.includes(p.id)
        );
        setProducts(filtered.slice(0, 4));
      } catch {}
    };
    load();
  }, [cartProductIds.join(",")]);

  if (products.length === 0) return null;

  return (
    <div className="border-t border-zinc-100 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-[#B8973E]">
          Bunları da beğenebilirsiniz
        </span>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p) => {
          const discount = p.comparePrice
            ? Math.round((1 - Number(p.price) / Number(p.comparePrice)) * 100)
            : null;

          return (
            <div key={p.id} className="group relative bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 hover:border-[#D4AF5A] hover:shadow-md transition-all duration-200">
              <Link href={`/products/${p.slug}`} prefetch={false}>
                <div className="relative aspect-square">
                  <ProductImage
                    src={p.images?.[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 160px"
                    unoptimized
                    className="object-cover p-2"
                    fallbackLabel=""
                  />
                  {discount && (
                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      -%{discount}
                    </span>
                  )}
                </div>
                <div className="px-2.5 pb-2 pt-1">
                  <p className="text-[11px] text-zinc-500 truncate">{p.brand?.name ?? ""}</p>
                  <p className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-snug mt-0.5 min-h-[2rem]">
                    {p.name}
                  </p>
                  <p className="text-sm font-black text-zinc-900 mt-1">
                    ₺{Number(p.price).toLocaleString("tr-TR")}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => {
                  if (p.stock === 0) { toast.error("Stokta yok"); return; }
                  addItem({
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    price: Number(p.price),
                    image: p.images?.[0] ?? "",
                    quantity: 1,
                  });
                  toast.success("Sepete eklendi!");
                }}
                disabled={p.stock === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-[#B8973E] text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-3 h-3" />
                {p.stock === 0 ? "Tükendi" : "Ekle"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
