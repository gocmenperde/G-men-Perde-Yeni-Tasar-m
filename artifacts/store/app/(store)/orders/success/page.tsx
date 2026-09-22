import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Truck, ShoppingBag, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ödeme Başarılı | Göçmen Perde" };

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  return (
    <div className="min-h-[80vh] bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-10 text-center shadow-xl mb-4">
          {/* Animated check */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25" />
            <div className="relative w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-zinc-900 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-zinc-500 mb-1 leading-relaxed">
            Ödemeniz başarıyla tamamlandı. Siparişiniz hazırlanmaya başlandı.
          </p>

          {orderId && (
            <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl px-4 py-2 mt-3 mb-2">
              <Package className="w-4 h-4 text-[#B8973E]" />
              <span className="text-sm text-zinc-600 font-mono font-bold">
                #{orderId.slice(-10).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* What's next */}
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-5 mb-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Sırada Ne Var?</p>
          <div className="space-y-3">
             {[
               { icon: Mail, text: "Sipariş onay e-postası gönderildi." },
               { icon: Package, text: "Ürününüz 1–3 iş gününde hazırlanacak." },
               { icon: Truck, text: "Kargoya verildiğinde takip numarası paylaşılacak." },
             ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-zinc-600">
                 <Icon className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              href={`/orders/${orderId}`}
              className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-[#B8973E] text-white font-black rounded-2xl transition-colors shadow-lg"
            >
              <Package className="w-4 h-4" />
              Siparişimi Takip Et <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-[#E8E0D5] hover:border-[#D4AF5A] text-zinc-700 font-semibold rounded-2xl transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
