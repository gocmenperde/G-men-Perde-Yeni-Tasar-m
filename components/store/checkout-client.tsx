"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";
import { ShieldCheck, Tag, Truck } from "lucide-react";



type NeighborhoodData = {
  [city: string]: {
    [district: string]: {
      neighborhoods: string[];
      streets: string[];
    };
  };
};

const TURKEY_ADDRESS_DATA: NeighborhoodData = {
  İstanbul: {
    Kadıköy: {
      neighborhoods: ["Caferağa", "Kozyatağı", "Fenerbahçe"],
      streets: ["Bağdat Caddesi", "Moda Caddesi", "General Asım Gündüz Caddesi"],
    },
    Beşiktaş: {
      neighborhoods: ["Levent", "Etiler", "Ortaköy"],
      streets: ["Nispetiye Caddesi", "Büyükdere Caddesi", "Çırağan Caddesi"],
    },
  },
  Ankara: {
    Çankaya: {
      neighborhoods: ["Kızılay", "Bahçelievler", "Yıldız"],
      streets: ["Atatürk Bulvarı", "Tunalı Hilmi Caddesi", "Cinnah Caddesi"],
    },
    Keçiören: {
      neighborhoods: ["Etlik", "Aşağı Eğlence", "Kalaba"],
      streets: ["Fatih Caddesi", "Sanatoryum Caddesi", "Bağlum Bulvarı"],
    },
  },
  İzmir: {
    Konak: {
      neighborhoods: ["Alsancak", "Güzelyalı", "Mithatpaşa"],
      streets: ["Kıbrıs Şehitleri Caddesi", "Mustafa Kemal Sahil Bulvarı", "Mithatpaşa Caddesi"],
    },
    Karşıyaka: {
      neighborhoods: ["Bostanlı", "Mavişehir", "Atakent"],
      streets: ["Cemal Gürsel Caddesi", "Girne Bulvarı", "Cahar Dudayev Bulvarı"],
    },
  },
};
const schema = z.object({
  fullName: z.string().min(3, "Ad soyad en az 3 karakter olmalı"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  city: z.string().min(2, "Şehir giriniz"),
  district: z.string().min(2, "İlçe giriniz"),
  neighborhood: z.string().min(2, "Mahalle seçiniz"),
  street: z.string().min(2, "Cadde/Sokak seçiniz"),
  address: z.string().min(10, "Açık adres en az 10 karakter olmalı"),
});

type Form = z.infer<typeof schema>;

export default function CheckoutClient() {
  const { items, total, clearCart, removeItem } = useCartStore();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const sanitizeCart = () => {
    if (typeof window === "undefined") return items;
    try {
      const raw = window.localStorage.getItem("gocmen-products");
      const parsed = raw ? JSON.parse(raw) : [];
      const validIds = new Set(
        Array.isArray(parsed) ? parsed.map((item: any) => item?.id).filter(Boolean) : [],
      );
      if (!validIds.size) return items;
      const invalidItems = items.filter((item) => !validIds.has(item.id));
      invalidItems.forEach((item) => removeItem(item.id));
      if (invalidItems.length > 0) {
        toast.error("Geçersiz veya silinmiş ürünler sepetten temizlendi.");
      }
      return items.filter((item) => validIds.has(item.id));
    } catch {
      return items;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const city = watch("city");
  const district = watch("district");
  const cities = useMemo(() => Object.keys(TURKEY_ADDRESS_DATA), []);
  const districts = useMemo(() => (city ? Object.keys(TURKEY_ADDRESS_DATA[city] ?? {}) : []), [city]);
  const neighborhoodOptions = useMemo(() => (city && district ? (TURKEY_ADDRESS_DATA[city]?.[district]?.neighborhoods ?? []) : []), [city, district]);
  const streetOptions = useMemo(() => (city && district ? (TURKEY_ADDRESS_DATA[city]?.[district]?.streets ?? []) : []), [city, district]);

  const subtotal = total();
  const shipping = subtotal >= 500 ? 0 : 49.9;
  const grandTotal = Math.max(0, subtotal - discount) + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Geçersiz kupon");
      setDiscount(data.discount);
      setAppliedCouponCode(couponCode.trim().toUpperCase());
      toast.success(`Kupon uygulandı! ₺${data.discount.toLocaleString("tr-TR")} indirim kazandınız.`);
    } catch (err: any) {
      toast.error(err.message ?? "Kupon geçersiz.");
      setDiscount(0);
      setAppliedCouponCode("");
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (values: Form) => {
    const cleanedItems = sanitizeCart();
    if (cleanedItems.length === 0) {
      toast.error("Sepetiniz boş.");
      return;
    }
    setLoading(true);
    try {
      const orderId = `gocmen-${Date.now()}`;
      const amount = Math.round(grandTotal * 100);
      const paytrPayload = {
        merchant_oid: orderId,
        payment_amount: String(amount),
        user_email: `musteri+${orderId}@gocmenkirtasiye.local`,
        user_name: values.fullName,
        user_address: `${values.neighborhood} Mah., ${values.street}, ${values.address}, ${values.district}/${values.city}`,
        user_phone: values.phone,
      };

      window.localStorage.setItem(
        "gocmen-last-order",
        JSON.stringify({
          id: orderId,
          amount,
          couponCode: appliedCouponCode || null,
          createdAt: new Date().toISOString(),
          items: cleanedItems.map((i) => ({ id: i.id, name: i.name, qty: i.quantity })),
          address: values,
        }),
      );

      clearCart();
      toast.success("Siparişiniz oluşturuldu, PayTR ödeme sayfasına yönlendiriliyorsunuz.");
      router.push(`/payment/paytr?${new URLSearchParams(paytrPayload).toString()}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold dark:text-white mb-3">Sepetiniz boş.</p>
        <Link href="/products" className="text-amber-500 hover:underline">
          Alışverişe devam et →
        </Link>
      </div>
    );
  }

  const inp =
    "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const lbl = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";
  const errClass = "text-red-500 text-xs mt-1";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">Güvenli Ödeme</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white mb-5">
              <Truck className="w-5 h-5 text-amber-500" /> Teslimat Bilgileri
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={lbl}>Ad Soyad</label><input className={inp} {...register("fullName")} />{errors.fullName && <p className={errClass}>{errors.fullName.message}</p>}</div>
              <div><label className={lbl}>Telefon</label><input className={inp} {...register("phone")} />{errors.phone && <p className={errClass}>{errors.phone.message}</p>}</div>
              <div><label className={lbl}>İl</label><select className={inp} {...register("city", { onChange: () => { setValue("district", ""); setValue("neighborhood", ""); setValue("street", ""); } })}><option value="">İl seçin</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select>{errors.city && <p className={errClass}>{errors.city.message}</p>}</div>
              <div><label className={lbl}>İlçe</label><select className={inp} disabled={!city} {...register("district", { onChange: () => { setValue("neighborhood", ""); setValue("street", ""); } })}><option value="">İlçe seçin</option>{districts.map((d) => <option key={d} value={d}>{d}</option>)}</select>{errors.district && <p className={errClass}>{errors.district.message}</p>}</div>
              <div><label className={lbl}>Mahalle</label><select className={inp} disabled={!district} {...register("neighborhood")}><option value="">Mahalle seçin</option>{neighborhoodOptions.map((n) => <option key={n} value={n}>{n}</option>)}</select>{errors.neighborhood && <p className={errClass}>{errors.neighborhood.message}</p>}</div>
              <div><label className={lbl}>Cadde / Sokak</label><select className={inp} disabled={!district} {...register("street")}><option value="">Cadde/Sokak seçin</option>{streetOptions.map((st) => <option key={st} value={st}>{st}</option>)}</select>{errors.street && <p className={errClass}>{errors.street.message}</p>}</div>
              <div className="sm:col-span-2"><label className={lbl}>Adres detayı (No, daire vb.)</label><textarea rows={3} className={inp} {...register("address")} />{errors.address && <p className={errClass}>{errors.address.message}</p>}</div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white mb-4">
              <Tag className="w-5 h-5 text-amber-500" /> İndirim Kuponu
            </div>
            <div className="flex gap-3">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Kupon kodu" className={`${inp} font-mono`} />
              <button type="button" onClick={applyCoupon} disabled={couponLoading} className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
                {couponLoading ? "..." : "Uygula"}
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white mb-4">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> PayTR ile Güvenli Ödeme
            </div>
            <p className="text-zinc-500 text-sm">Sipariş tamamlandığında PayTR ödeme ekranına yönlendirilirsiniz.</p>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black py-4 rounded-2xl transition-all hover:shadow-xl disabled:opacity-50 text-lg">
            {loading ? "Yönlendiriliyor..." : `Ödemeye Geç — ₺${grandTotal.toLocaleString("tr-TR")}`}
          </button>
        </form>

        <aside className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 h-fit sticky top-24">
          <h2 className="font-black text-lg text-zinc-900 dark:text-white mb-5">Sipariş ({items.length})</h2>
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.quantity} adet</p>
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">₺{(item.price * item.quantity).toLocaleString("tr-TR")}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
