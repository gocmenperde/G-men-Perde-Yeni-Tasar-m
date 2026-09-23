"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  CheckCircle2,
  Clock3,
  Crown,
  Gift,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WalletCards,
  Zap,
} from "lucide-react";
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

  const discountLabel = status.discountValue > 0
    ? status.discountType === "FIXED"
      ? `₺${status.discountValue.toLocaleString("tr-TR")} indirim`
      : `%${status.discountValue} indirim`
    : "Özel fırsatlar";

  const benefits = [
    {
      icon: BadgePercent,
      eyebrow: "HER SİPARİŞTE",
      title: discountLabel,
      text: "Seçili ürünlerde Premium avantajınız ödeme adımında otomatik uygulanır.",
      tone: "from-amber-100 to-orange-50 text-amber-700",
    },
    {
      icon: Truck,
      eyebrow: "KAPINIZA KADAR",
      title: status.freeShipping ? "Ücretsiz kargo" : "Avantajlı kargo",
      text: status.freeShipping ? "Siparişlerinizi ek kargo bedeli olmadan bekleyin." : "Kampanyalara göre avantajlı kargo fırsatlarından yararlanın.",
      tone: "from-sky-100 to-cyan-50 text-sky-700",
    },
    {
      icon: BadgeCheck,
      eyebrow: "SİZE ÖZEL",
      title: "Premium rozeti",
      text: "Hesabınızda görünen özel rozetle Göçmen ayrıcalıklarını her yerde hissedin.",
      tone: "from-violet-100 to-fuchsia-50 text-violet-700",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#fbfaf7]">
      <section className="relative isolate overflow-hidden bg-[#25221e] text-white">
        <div className="absolute -right-28 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full border border-amber-200/15 bg-amber-200/5 blur-[1px]" />
        <div className="absolute -bottom-48 left-1/3 -z-10 h-[32rem] w-[32rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.16em] text-amber-200">
              <Crown className="h-4 w-4" /> Göçmen Premium
            </span>
            <h1 className="mt-6 max-w-2xl font-serif text-5xl font-medium leading-[.98] tracking-[-.055em] sm:text-7xl">
              Alışverişin <span className="text-amber-300">daha güzel hali.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">
              Sık alışveriş yapanlar için daha akıllı, daha ekonomik ve daha ayrıcalıklı bir deneyim. Premium ile her siparişiniz size daha çok kazandırsın.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={startPayment} disabled={loading || !status.enabled} className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-amber-950/20 transition hover:bg-amber-300 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                {status.active ? "Bir ay daha yenile" : `Premium ol — ₺${status.price.toLocaleString("tr-TR")}`}
              </button>
              <Link href="#avantajlar" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-bold text-zinc-200 transition hover:bg-white/10">
                Avantajları gör <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[.12em] text-stone-400">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-300" /> Otomatik yenileme yok</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" /> Güvenli ödeme</span>
            </div>
            {status.active && status.premiumUntil && (
              <p className="mt-5 text-sm font-semibold text-amber-200">Aktif üyeliğiniz {new Date(status.premiumUntil).toLocaleDateString("tr-TR")} tarihine kadar geçerli.</p>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-8 rounded-[2.5rem] bg-amber-300/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-amber-200/25 bg-gradient-to-br from-[#5a4524] via-[#30271d] to-[#171513] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-[.25em] text-amber-100/70">GÖÇMEN PERDE</span>
                <Crown className="h-7 w-7 text-amber-300" strokeWidth={1.5} />
              </div>
              <div className="my-14 text-center">
                <p className="font-serif text-5xl tracking-[.12em] text-amber-200">PREMIUM</p>
                <p className="mt-3 text-sm text-stone-300">Her alışverişte daha fazlası.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-[11px] font-bold text-stone-300">
                <span className="flex items-center gap-2"><BadgePercent className="h-4 w-4 text-amber-300" /> Özel indirim</span>
                <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-300" /> Ücretsiz kargo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="avantajlar" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-black uppercase tracking-[.2em] text-[#b8973e]">NEDEN PREMIUM?</span>
          <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#302b23] sm:text-5xl">İyi seçim, alışverişte de kendini belli eder.</h2>
          <p className="mt-4 text-base leading-7 text-[#756f65]">Premium sadece bir rozet değil; verdiğiniz her siparişte daha rahat ve daha avantajlı hissetmeniz için tasarlanmış bir üyelik.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, eyebrow, title, text, tone }) => (
            <article key={title} className="group rounded-[1.75rem] border border-[#e8e1d4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone}`}><Icon className="h-6 w-6" /></div>
              <p className="mt-7 text-[10px] font-black uppercase tracking-[.18em] text-[#b8973e]">{eyebrow}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#302b23]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#756f65]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f4f0e7]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-12">
          <div>
            <span className="text-xs font-black uppercase tracking-[.2em] text-[#b8973e]">SİZE NE KATAR?</span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#302b23] sm:text-5xl">Daha az düşünün, daha çok keyif alın.</h2>
            <p className="mt-5 leading-7 text-[#756f65]">İhtiyacınız olan ürünleri seçerken üyelik avantajlarınız arka planda sizin için çalışır. Ekstra kupon aramadan, kampanya beklemeden, her ay daha bilinçli alışveriş yapın.</p>
            <Link href="/products" className="mt-7 inline-flex items-center gap-2 font-black text-[#302b23] underline decoration-[#c49a3a] decoration-2 underline-offset-4">Koleksiyonu keşfet <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShoppingBag, title: "Sepette otomatik avantaj", text: "Premium indiriminiz uygun siparişlerde ayrıca kod aramadan uygulanır." },
              { icon: WalletCards, title: "Bütçeniz size kalsın", text: "Kargo ve indirim avantajları, toplam sepet tutarını daha kontrollü hale getirir." },
              { icon: HeartHandshake, title: "Sizi tanıyan deneyim", text: "Hesabınızdaki Premium rozeti, ayrıcalıklı müşteri deneyiminizi görünür kılar." },
              { icon: Zap, title: "Hemen aktif", text: "Ödeme tamamlandığında üyeliğiniz bir ay boyunca kullanılmaya başlar." },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-[#e0d7c7] bg-[#fffdf9] p-5">
                <Icon className="h-6 w-6 text-[#b8973e]" />
                <h3 className="mt-5 font-black text-[#302b23]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#756f65]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <span className="text-xs font-black uppercase tracking-[.2em] text-[#b8973e]">NASIL ÇALIŞIR?</span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#302b23] sm:text-5xl">Üç adımda Premium dünyası.</h2>
            <p className="mt-4 max-w-md leading-7 text-[#756f65]">Karmaşık abonelikler yok. Kontrol sizde, avantajlarınız her zaman hesabınızda.</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Crown, number: "01", title: "Premium’u başlatın", text: `Aylık ₺${status.price.toLocaleString("tr-TR")} karşılığında üyeliğinizi güvenli ödeme ile başlatın.` },
              { icon: Gift, number: "02", title: "Avantajlarınızı kullanın", text: "Üyeliğiniz aktif olur olmaz indirim ve kargo avantajlarınız hesabınıza tanımlanır." },
              { icon: Clock3, number: "03", title: "Süreyi siz yönetin", text: "Otomatik yenileme yok. İhtiyacınız olduğunda dilediğiniz zaman bir ay daha uzatın." },
            ].map(({ icon: Icon, number, title, text }) => (
              <div key={number} className="flex gap-4 rounded-3xl border border-[#e8e1d4] bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbf3df] text-[#b8973e]"><Icon className="h-5 w-5" /></div>
                <div><span className="text-[10px] font-black tracking-[.18em] text-[#b8973e]">{number}</span><h3 className="mt-1 font-black text-[#302b23]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#756f65]">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="rounded-[2rem] bg-[#302b23] p-6 text-white shadow-2xl sm:p-10">
          <div className="text-center">
            <Sparkles className="mx-auto h-6 w-6 text-amber-300" />
            <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">Merak edilenler</h2>
          </div>
          <div className="mt-8 divide-y divide-white/10">
            {[
              ["Üyelik otomatik olarak yenilenir mi?", "Hayır. Premium manuel yenilenir; her ay devam edip etmeyeceğinize siz karar verirsiniz."],
              ["İndirim ne zaman uygulanır?", "Üyeliğiniz aktif olduktan sonra uygun ürün ve siparişlerde ödeme adımında otomatik olarak görünür."],
              ["Premium’u kimler kullanabilir?", "Göçmen Perde hesabı olan tüm müşteriler Premium üyeliği satın alabilir ve avantajlarını hesapları üzerinden kullanabilir."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-stone-100 [&::-webkit-details-marker]:hidden">
                  {question}<span className="text-2xl font-light text-amber-300 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8e1d4] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-5 py-12 text-center sm:px-8 lg:flex-row lg:text-left">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#b8973e]">HAZIR MISINIZ?</p><h2 className="mt-2 font-serif text-3xl text-[#302b23]">Ayrıcalıklı alışveriş şimdi başlasın.</h2></div>
          <button onClick={startPayment} disabled={loading || !status.enabled} className="inline-flex items-center gap-2 rounded-2xl bg-[#302b23] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#b8973e] disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4 text-amber-300" />}{status.active ? "Bir ay daha yenile" : `Premium’a geç — ₺${status.price.toLocaleString("tr-TR")}`}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </main>
  );
}