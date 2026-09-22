import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Truck, Clock3, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Teslimat Koşulları | Göçmen Perde",
  description: "Göçmen Perde kargo, teslimat süreleri ve teslimat koşulları.",
  alternates: { canonical: "https://www.gocmenkirtasiye.com.tr/delivery" },
};

export default function DeliveryPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">Teslimat Koşulları</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Truck className="w-6 h-6 text-amber-600" />
            <h1 className="text-3xl font-black text-zinc-900">Teslimat Koşulları</h1>
          </div>
          <p className="text-zinc-600 text-sm">Siparişleriniz ödeme onayı sonrası hazırlanır ve anlaşmalı kargo firmasıyla gönderilir.</p>
        </div>

        <div className="space-y-4 text-sm text-zinc-600">
          <section className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <h2 className="font-black text-zinc-900 mb-3 flex items-center gap-2"><Clock3 className="w-4 h-4" /> Hazırlık ve Teslim Süresi</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Siparişler genellikle 1 iş günü içinde hazırlanır.</li>
              <li>Teslimat süresi Türkiye geneli ortalama 1-5 iş günüdür.</li>
              <li>Resmi tatil ve kampanya dönemlerinde süre uzayabilir.</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <h2 className="font-black text-zinc-900 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Kargo ve Teslimat Şartları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>500₺ ve üzeri siparişlerde kargo ücretsizdir.</li>
              <li>Adres bilgilerinin doğruluğu müşterinin sorumluluğundadır.</li>
              <li>Teslimat anında paketinizi kontrol ederek hasar durumunda tutanak tutturunuz.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
