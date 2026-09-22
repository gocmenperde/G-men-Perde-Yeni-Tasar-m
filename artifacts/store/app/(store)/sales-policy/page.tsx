import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, CreditCard, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "Satış Politikası | Göçmen Perde",
  description: "Göçmen Perde satış politikası, sipariş onayı, fiyatlandırma ve ödeme kuralları.",
  alternates: { canonical: "https://www.gocmenperde.com.tr/sales-policy" },
};

export default function SalesPolicyPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">Satış Politikası</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-black text-zinc-900">Satış Politikası</h1>
          </div>
          <p className="text-zinc-600 text-sm">Bu sayfa, sipariş oluşturma ve ödeme süreçlerine dair temel satış koşullarını açıklar.</p>
        </div>

        <div className="space-y-4 text-sm text-zinc-600">
          <section className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <h2 className="font-black text-zinc-900 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> Sipariş ve Fiyatlandırma</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ürün fiyatları aksi belirtilmedikçe KDV dahildir.</li>
              <li>Stok durumuna bağlı olarak sipariş onayı sonrası güncelleme yapılabilir.</li>
              <li>Açık fiyat/hizmet hatalarında siparişi iptal etme hakkı saklıdır.</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <h2 className="font-black text-zinc-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Ödeme ve Faturalandırma</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ödemeler güvenli ödeme altyapısı üzerinden alınır.</li>
              <li>Kart bilgileri sistemlerimizde saklanmaz.</li>
              <li>E-fatura/e-arşiv fatura, sipariş sonrası kayıtlı e-posta adresine gönderilir.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
