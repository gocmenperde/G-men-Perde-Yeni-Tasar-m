"use client";

import { ChangeEvent } from "react";
import {
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  Star,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "TOP 500", icon: "⭐" },
  { name: "Manga", icon: "📕" },
  { name: "Çocuk", icon: "👑" },
  { name: "Hobi", icon: "🎨" },
];

type SetProduct = {
  id: string;
  name: string;
  brand: string;
  oldPrice: string;
  price: string;
  discount: string;
  image: string;
};

const initialSetProducts: SetProduct[] = [
  {
    id: "set-1",
    name: "İlkokul Başlangıç Seti",
    brand: "Keskin Color",
    oldPrice: "799,00 TL",
    price: "649,00 TL",
    discount: "%18",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "set-2",
    name: "Ofis Düzen Seti",
    brand: "Faber-Castell",
    oldPrice: "1.049,00 TL",
    price: "899,00 TL",
    discount: "%14",
    image:
      "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=600&q=80",
  },
];

export function BkmStyleHome() {
  const [setProducts, setSetProducts] = useState(initialSetProducts);

  const onSetFieldChange = (
    id: string,
    field: keyof Omit<SetProduct, "id">,
    value: string,
  ) => {
    setSetProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addNewSetProduct = () => {
    setSetProducts((prev) => [
      ...prev,
      {
        id: `set-${Date.now()}`,
        name: "Yeni Set",
        brand: "Marka",
        oldPrice: "0,00 TL",
        price: "0,00 TL",
        discount: "%0",
        image:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      },
    ]);
  };

  const removeSetProduct = (id: string) => {
    setSetProducts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl bg-gradient-to-b from-[#f8f3ea] to-[#f4f4f4] text-zinc-800">
      <header className="sticky top-0 z-20 px-4 pb-4 pt-5 md:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-white/55 backdrop-blur-xl" />
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-xl p-2 text-zinc-700"><Menu /></button>
          <div className="text-center leading-none">
            <p className="text-xl font-black uppercase tracking-[0.2em] text-zinc-900">Göçmen</p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.28em] text-amber-700">KIRTASİYE</p>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle2 className="h-7 w-7 text-zinc-500" />
            <div className="relative">
              <ShoppingCart className="h-7 w-7 text-zinc-500" />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">0</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-zinc-500">
          <Search className="h-5 w-5" />
          <input placeholder="Aradığınız ürünün adını yazınız." className="w-full bg-transparent text-sm outline-none" />
        </div>
      </header>

      <section className="px-3 py-3 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fff5cc] to-[#d5f8b2] p-5">
          <p className="text-xs font-medium text-[#7d6d22]">Okul dönemi kampanyalarını keşfet.</p>
          <h1 className="mt-1 text-3xl font-black leading-none text-[#e7431c]">KIRTASİYEDE BÜYÜK İNDİRİM</h1>
          <button className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">Hemen İncele</button>
        </div>
      </section>

      <section className="px-3 py-2 md:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => (
            <button key={cat.name} className="rounded-3xl bg-white p-3 shadow-sm">
              <div className="text-3xl">{cat.icon}</div>
              <p className="mt-2 text-xs font-semibold">{cat.name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-3 py-4 md:px-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <span>Anasayfa</span><ChevronRight className="h-4 w-4 text-red-500" /><span>Kırtasiye</span><ChevronRight className="h-4 w-4 text-red-500" /><span>Setler</span>
        </div>
        <h2 className="text-4xl font-black text-red-600">Setler</h2>
        <h3 className="mb-4 text-4xl font-black text-zinc-800">Setler</h3>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {setProducts.map((product) => (
            <article key={product.id} className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm">
              <img src={product.image} alt={product.name} className="h-44 w-full rounded-2xl object-cover" />
              <div className="my-3 flex gap-1 text-red-600">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</div>
              <p className="line-clamp-2 text-lg font-bold leading-tight">{product.name}</p>
              <p className="text-sm text-zinc-500">{product.brand}</p>
              <p className="mt-1 text-2xl font-black text-red-600">{product.discount}</p>
              <p className="text-sm text-zinc-400 line-through">{product.oldPrice}</p>
              <button className="mt-3 w-full rounded-xl bg-red-600 py-3 font-bold text-white">Sepete Ekle · {product.price}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="px-3 pb-8 md:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h4 className="text-lg font-black text-zinc-900">Admin - Setler Düzenleme</h4>
          <p className="mb-4 mt-1 text-xs text-zinc-500">Bu alandan set ürünlerini ve fiyatlarını anasayfada anında güncelleyebilirsiniz.</p>
          <div className="space-y-4">
            {setProducts.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-200 p-3">
                <div className="grid grid-cols-1 gap-2">
                  {([
                    ["name", "Ürün Adı", item.name],
                    ["brand", "Marka", item.brand],
                    ["price", "Satış Fiyatı", item.price],
                    ["oldPrice", "Eski Fiyat", item.oldPrice],
                    ["discount", "İndirim", item.discount],
                    ["image", "Görsel URL", item.image],
                  ] as [keyof Omit<SetProduct, "id">, string, string][]).map(([field, label, value]) => (
                    <label key={field} className="text-xs font-semibold text-zinc-700">
                      {label}
                      <input
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onSetFieldChange(item.id, field, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-xs font-normal"
                      />
                    </label>
                  ))}
                </div>
                <button onClick={() => removeSetProduct(item.id)} className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700">Seti Sil</button>
              </div>
            ))}
          </div>
          <button onClick={addNewSetProduct} className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white">Yeni Set Ekle</button>
        </div>
      </section>
    </main>
  );
}
