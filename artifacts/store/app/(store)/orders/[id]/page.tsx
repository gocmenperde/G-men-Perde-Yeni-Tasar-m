import { getServerToken } from "@/lib/get-server-token";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CreditCard, AlertTriangle, Clock3, RefreshCw, Truck, CheckCircle2, XCircle } from "lucide-react";
import { getPublicImageUrl } from "@/lib/image-url";

export const metadata: Metadata = { title: "Sipariş Detayı | Göçmen Perde" };

const STATUS: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
  AWAITING_PAYMENT: { label: "Ödeme Bekleniyor", color: "bg-orange-100 text-orange-700", icon: CreditCard },
  PAYMENT_FAILED:   { label: "Ödeme Başarısız",  color: "bg-red-100 text-red-700",       icon: AlertTriangle },
  PENDING:          { label: "Beklemede",         color: "bg-yellow-100 text-yellow-700", icon: Clock3 },
  PROCESSING:       { label: "İşleniyor",         color: "bg-blue-100 text-blue-700",     icon: RefreshCw },
  SHIPPED:          { label: "Kargoda",           color: "bg-purple-100 text-purple-700", icon: Truck },
  PAID:             { label: "Ödendi",            color: "bg-teal-100 text-teal-700",     icon: CreditCard },
  DELIVERED:        { label: "Teslim Edildi",     color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  CANCELED:         { label: "İptal Edildi",      color: "bg-red-100 text-red-700",       icon: XCircle },
};

const TIMELINE = [
  { key: "AWAITING_PAYMENT", label: "Ödeme Bekleniyor", desc: "Ödeme onayınız bekleniyor" },
  { key: "PAID",             label: "Ödeme Alındı",     desc: "Ödemeniz başarıyla alındı" },
  { key: "PROCESSING",       label: "Hazırlanıyor",     desc: "Siparişiniz hazırlanıyor" },
  { key: "SHIPPED",          label: "Kargoya Verildi",  desc: "Siparişiniz yolda" },
  { key: "DELIVERED",        label: "Teslim Edildi",    desc: "Siparişiniz teslim edildi" },
];
const STEP_ORDER = ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
      coupon: true,
    },
  });

  if (!order || order.userId !== token.id) notFound();

  const st = STATUS[order.status] ?? STATUS.PENDING;
  const stepIdx = STEP_ORDER.indexOf(order.status);
  const isCanceled = ["CANCELED", "CANCELLED", "PAYMENT_FAILED"].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-[#FAF7F2] min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account" className="text-zinc-400 hover:text-[#B8973E] transition-colors text-sm">
          ← Hesabım
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm">Sipariş Detayı</span>
      </div>

      {/* Başlık */}
      <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-zinc-900">
              Sipariş #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
           <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap ${st.color}`}>
             <st.icon className="w-4 h-4" aria-hidden="true" /> {st.label}
          </span>
        </div>

        {/* Sipariş Takip Timeline */}
        {!isCanceled && (
          <div className="mt-6 pt-6 border-t border-[#E8E0D5]">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-5">Sipariş Durumu</p>
            <div className="flex items-start">
              {TIMELINE.map((step, i) => {
                const done = stepIdx >= i;
                const current = stepIdx === i;
                return (
                  <div key={step.key} className="flex items-start flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                        done ? "bg-[#D4AF5A] border-[#D4AF5A] shadow-amber-200" : "border-[#E8E0D5] bg-white"
                      } ${current ? "ring-4 ring-amber-100" : ""}`}>
                        {done ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        )}
                      </div>
                      <p className={`text-[10px] font-semibold text-center mt-2 max-w-[60px] leading-tight ${done ? "text-[#B8973E]" : "text-zinc-400"}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-0.5 mt-4 mx-1 transition-all rounded-full ${stepIdx > i ? "bg-[#D4AF5A]" : "bg-[#E8E0D5]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCanceled && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-600 font-medium">Bu sipariş iptal edilmiştir.</p>
          </div>
        )}
      </div>

      {/* Ürünler */}
      <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-[#E8E0D5]">
          <p className="font-bold text-zinc-900 text-sm">Sipariş İçeriği ({order.items.length} ürün)</p>
        </div>
        <div className="p-6 space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <Link href={`/products/${item.product.slug}`} className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8E0D5] flex-shrink-0 hover:opacity-80 transition-opacity">
                {getPublicImageUrl(item.product.images?.[0]) ? (
                  <Image src={getPublicImageUrl(item.product.images[0])!} alt={item.product.name} fill className="object-contain p-1" />
                ) : null}
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`}>
                  <p className="font-semibold text-zinc-900 text-sm hover:text-[#B8973E] transition-colors">{item.product.name}</p>
                </Link>
                <p className="text-zinc-400 text-xs mt-0.5">{item.quantity} adet × ₺{Number(item.price).toLocaleString("tr-TR")}</p>
              </div>
              <p className="font-bold text-zinc-900">
                ₺{(item.quantity * Number(item.price)).toLocaleString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-[#E8E0D5] space-y-2 bg-[#FAF7F2]">
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Ara Toplam</span>
            <span>₺{Number(order.subtotal).toLocaleString("tr-TR")}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>İndirim {order.coupon ? `(${order.coupon.code})` : ""}</span>
              <span>-₺{Number(order.discount).toLocaleString("tr-TR")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Kargo</span>
            <span className={Number(order.shipping) === 0 ? "text-green-600 font-medium" : ""}>
              {Number(order.shipping) === 0 ? "ÜCRETSİZ" : `₺${Number(order.shipping).toLocaleString("tr-TR")}`}
            </span>
          </div>
          <div className="flex justify-between font-black text-lg text-zinc-900 pt-3 border-t border-[#E8E0D5]">
            <span>Toplam</span>
            <span>₺{Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Teslimat Adresi */}
      {(order as any).address && (
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 mb-4">
          <p className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-2">
            <span>📦</span> Teslimat Adresi
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed">{(order as any).address}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/account" className="flex-1 text-center py-3 bg-white border border-[#E8E0D5] hover:border-[#D4AF5A] text-zinc-700 font-semibold rounded-2xl transition-all text-sm">
          ← Hesabıma Dön
        </Link>
        <Link href="/products" className="flex-1 text-center py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-2xl transition-colors text-sm">
          Alışverişe Devam
        </Link>
      </div>
    </div>
  );
}
