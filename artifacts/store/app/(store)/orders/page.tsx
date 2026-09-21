import { getServerToken } from "@/lib/get-server-token";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Package, ChevronRight, ShoppingBag, Clock, Truck, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { getPublicImageUrl } from "@/lib/image-url";

export const metadata: Metadata = {
  title: "Siparişlerim",
  robots: { index: false, follow: false },
};

const STATUS: Record<string, { label: string; color: string; icon: any; step: number }> = {
  AWAITING_PAYMENT: { label: "Ödeme Bekliyor", color: "bg-orange-100 text-orange-700 border-orange-200", icon: CreditCard, step: 0 },
  PAYMENT_FAILED:   { label: "Ödeme Başarısız", color: "bg-red-100 text-red-700 border-red-200",       icon: XCircle,     step: 0 },
  PENDING:          { label: "Beklemede",        color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock,    step: 1 },
  PROCESSING:       { label: "Hazırlanıyor",     color: "bg-blue-100 text-blue-700 border-blue-200",   icon: Package,     step: 2 },
  SHIPPED:          { label: "Kargoda",          color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck,   step: 3 },
  DELIVERED:        { label: "Teslim Edildi",    color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, step: 4 },
  CANCELED:         { label: "İptal Edildi",     color: "bg-red-100 text-red-700 border-red-200",      icon: XCircle,     step: -1 },
};

const STEPS = ["Sipariş Alındı", "Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi"];

export default async function OrdersPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: token.id },
    include: {
      items: {
        include: { product: { select: { name: true, images: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 pb-28 sm:py-10 sm:pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#B8973E]">Göçmen Kırtasiye</p>
            <h1 className="mt-1 text-3xl font-black text-zinc-900">Siparişlerim</h1>
            <p className="text-zinc-400 text-sm mt-1">Hoş geldin, {token.name?.split(/\s+/)[0] ?? "değerli müşterimiz"} · {orders.length} sipariş</p>
          </div>
          <Link href="/account" className="inline-flex items-center gap-2 rounded-xl border border-[#E8E0D5] bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:border-[#D4AF5A] hover:text-[#B8973E]">
            Hesabıma dön <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E0D5] p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#FAF7F2] border-2 border-[#E8E0D5] flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-9 h-9 text-[#D4AF5A]" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2">Henüz Siparişiniz Yok</h2>
            <p className="text-zinc-400 mb-8 max-w-sm mx-auto">İlk siparişinizi verin ve kırtasiye dünyasını keşfedin!</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#B8973E] transition-colors shadow-lg">
              Alışverişe Başla <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const st = STATUS[order.status] ?? STATUS.PENDING;
              const Icon = st.icon;
              const currentStep = st.step;
              const previewItems = order.items.slice(0, 3);
              const extraCount = order.items.length - 3;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden hover:border-[#D4AF5A] hover:shadow-md transition-all">
                  {/* Header */}
                  <div className="flex flex-col items-start gap-3 border-b border-[#F5F0EA] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${order.status === "DELIVERED" ? "bg-green-50" : order.status === "CANCELED" || order.status === "PAYMENT_FAILED" ? "bg-red-50" : "bg-amber-50"}`}>
                        <Icon className={`w-4 h-4 ${order.status === "DELIVERED" ? "text-green-600" : order.status === "CANCELED" || order.status === "PAYMENT_FAILED" ? "text-red-500" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-zinc-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold sm:self-auto ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Products preview */}
                  <div className="p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      {previewItems.map((item: any) => (
                        <div key={item.id} className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8E0D5] flex-shrink-0">
                          {getPublicImageUrl(item.product.images?.[0]) ? (
                            <Image src={getPublicImageUrl(item.product.images[0])!} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-zinc-300" />
                            </div>
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-black text-zinc-500">+{extraCount}</span>
                        </div>
                      )}
                       <div className="ml-auto min-w-[5.5rem] text-right">
                        <p className="text-xs text-zinc-400">{order.items.length} ürün</p>
                        <p className="font-black text-zinc-900 text-xl">₺{Number(order.total).toLocaleString("tr-TR")}</p>
                      </div>
                    </div>

                    {/* Status timeline — only for active orders */}
                    {currentStep >= 1 && order.status !== "CANCELED" && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute left-0 right-0 top-3 h-0.5 bg-[#E8E0D5]" />
                          <div
                            className="absolute left-0 top-3 h-0.5 bg-[#B8973E] transition-all duration-700"
                            style={{ width: `${Math.max(0, (currentStep - 1) / 3) * 100}%` }}
                          />
                          {STEPS.map((step, i) => {
                            const done = i < currentStep;
                            const active = i === currentStep - 1;
                            return (
                              <div key={step} className="relative flex flex-col items-center gap-1.5 z-10">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${done || active ? "bg-[#B8973E]" : "bg-white border-2 border-[#E8E0D5]"}`}>
                                  {done || active ? (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                  )}
                                </div>
                                <span className={`text-[9px] font-semibold text-center leading-tight max-w-[60px] ${done || active ? "text-[#B8973E]" : "text-zinc-400"}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Link href={`/orders/${order.id}`} className="w-full flex items-center justify-center gap-1.5 bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#D4AF5A] hover:bg-[#F5F0EA] text-zinc-700 font-semibold text-sm py-2.5 rounded-xl transition-all">
                      Sipariş Detayı <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
