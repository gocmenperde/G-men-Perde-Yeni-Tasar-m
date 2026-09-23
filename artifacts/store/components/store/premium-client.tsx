"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Gift, Loader2, ShieldCheck, Truck, Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type PremiumStatus = {
  enabled: boolean;
  price: number;
  discountType: string;
  discountValue: number;
  freeShipping: boolean;
  active: boolean;
  premiumUntil: string | null;
};

const FALLBACK_STATUS: PremiumStatus = {
  enabled: true,
  price: 79,
  discountType: "PERCENTAGE",
  discountValue: 10,
  freeShipping: true,
  active: false,
  premiumUntil: null,
};

export default function PremiumClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/premium/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await response.json();
        if (!response.ok || !json?.data) throw new Error("Premium bilgileri alınamadı.");
        setStatus(json.data);
      } catch {
        if (!controller.signal.aborted) setStatus(FALLBACK_STATUS);
      }
    };
    loadStatus();
    return () => controller.abort();
  }, []);

  const startPayment = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/premium");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/premium/create-payment", { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Ödeme başlatılamadı.");
      router.push(`/payment/paytr?membershipId=${json.data.membershipId}`);
    } catch (error: any) {
      toast.error(error.message ?? "Ödeme başlatılamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <section className="overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-2xl">
        <div className="grid gap-8 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.16em] text-amber-200">
              <Crown className="h-4 w-4" /> Göçmen Premium
            </span>
            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-6xl">Daha avantajlı alışveriş, her ay.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
              Premium üyeler özel indirimlere, ücretsiz kargoya ve hesaplarında görünen Premium rozetine sahip olur.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={startPayment} disabled={loading || !status.enabled} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-black text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                {status.active ? "Bir ay daha yenile" : `Premium ol — ₺${status.price.toLocaleString("tr-TR")}`}
              </button>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-bold text-zinc-200 transition hover:bg-white/10">
                Alışverişe dön <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {status.active && status.premiumUntil && (
              <p className="mt-4 text-sm font-semibold text-amber-200">Aktif üyeliğiniz {new Date(status.premiumUntil).toLocaleDateString("tr-TR")} tarihine kadar geçerli.</p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: Gift, title: "Özel indirim", text: status.discountValue > 0 ? `${status.discountType === "FIXED" ? `₺${status.discountValue}` : `%${status.discountValue}`} Premium indirimi` : "Adminin tanımladığı özel fırsatlar" },
              { icon: Truck, title: "Ücretsiz kargo", text: status.freeShipping ? "Her siparişte ücretsiz kargo" : "Kampanyalara göre avantajlı kargo" },
              { icon: ShieldCheck, title: "Premium rozet", text: "Hesabınızda Göçmen Premium Üyesi rozeti" },
              { icon: Sparkles, title: "Manuel yenileme", text: "Her ay dilediğinizde bir ay daha uzatın" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
                <Icon className="h-5 w-5 text-amber-300" />
                <p className="mt-3 font-black">{title}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}