import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Headphones,
  Palette,
  PenLine,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

interface HeroSettings {
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroBadge?: string | null;
  heroDesc?: string | null;
  heroCtaPrimaryText?: string | null;
  heroCtaPrimaryHref?: string | null;
  heroCtaSecText?: string | null;
  heroCtaSecHref?: string | null;
  trustBadge1Text?: string | null;
  trustBadge1Sub?: string | null;
  trustBadge2Text?: string | null;
  trustBadge2Sub?: string | null;
  trustBadge3Text?: string | null;
  trustBadge3Sub?: string | null;
  stat1Value?: string | null;
  stat1Label?: string | null;
  stat2Value?: string | null;
  stat2Label?: string | null;
  stat3Value?: string | null;
  stat3Label?: string | null;
}

function trustText(value: string | null | undefined, fallback: string) {
  if (!value || /iade|cayma|koşulsuz|kosulsuz|30\s*gün|kırtasiye|kitap|defter|kalem|okul|sanat/i.test(value)) return fallback;
  return value.replace(/\bherşey\b/gi, "Her şey");
}

function heroText(value: string | null | undefined, fallback: string) {
  if (!value || /iade|cayma|koşulsuz|kosulsuz|30\s*gün|kırtasiye|kitap|defter|kalem|okul|sanat/i.test(value)) return fallback;
  return value.replace(/\bherşey\b/gi, "Her şey");
}

function premiumLabel(value: string | null | undefined, fallback: string) {
  const text = value?.trim() || fallback;
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(
      /(^|[\s·/–—,-])([A-Za-zÇĞİIÖŞÜçğıöşü])/g,
      (_, separator, letter) => `${separator}${letter.toLocaleUpperCase("tr-TR")}`,
    );
}

const quickCategories = [
  { name: "Kalemler", href: "/kategori/kirtasiye", icon: PenLine, tone: "bg-[#F8E5C6] text-[#8A541F]" },
  { name: "Defterler", href: "/kategori/kareli-defter", icon: BookOpen, tone: "bg-[#DCE9E5] text-[#2D625C]" },
  { name: "Sanat", href: "/kategori/sulu-boyalar", icon: Palette, tone: "bg-[#F2DCDD] text-[#8E4D52]" },
];

export default function Hero({ settings }: { settings?: HeroSettings }) {
  const title = heroText(settings?.heroTitle, "Göçmen Perde");
  const subtitle = heroText(settings?.heroSubtitle, "Eviniz, iyi seçimlerle güzelleşir.");
  const description =
    heroText(
      settings?.heroDesc,
      "Bursa’dan Türkiye’nin her yerine; tül, fon, stor, zebra ve plise perdeler. Her ölçü, özenli bir başlangıç için hazırlanır.",
    );
  const primaryText = settings?.heroCtaPrimaryText || "Ürünleri keşfet";
  const primaryHref = settings?.heroCtaPrimaryHref || "/products";
  const secondaryText = settings?.heroCtaSecText || "İndirimleri gör";
  const secondaryHref = settings?.heroCtaSecHref || "/products?sale=true";
  const trust = [
    {
      icon: Truck,
      title: premiumLabel(trustText(settings?.trustBadge1Text, "Hızlı gönderim"), "Hızlı Gönderim"),
      text: premiumLabel(trustText(settings?.trustBadge1Sub, "Türkiye geneli"), "Türkiye Geneli"),
    },
    {
      icon: ShieldCheck,
      title: premiumLabel(trustText(settings?.trustBadge2Text, "Güvenli ödeme"), "Güvenli Ödeme"),
      text: premiumLabel(trustText(settings?.trustBadge2Sub, "Korunaklı alışveriş"), "Korunaklı Alışveriş"),
    },
    {
      icon: Headphones,
      title: premiumLabel(trustText(settings?.trustBadge3Text, "Uzman destek"), "Uzman Destek"),
      text: premiumLabel(trustText(settings?.trustBadge3Sub, "Bursa’dan gerçek destek"), "Bursa’dan Gerçek Destek"),
    },
  ];
  const stats = [
    [settings?.stat1Value || "30+", premiumLabel(settings?.stat1Label, "Yıl Deneyim")],
    [settings?.stat2Value || "500+", premiumLabel(settings?.stat2Label, "Ürün Seçeneği")],
    [settings?.stat3Value || "4.9", premiumLabel(settings?.stat3Label, "Müşteri Puanı")],
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--navy)] text-[#F8F3EA]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(240,222,188,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(240,222,188,.18)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute -right-32 -top-36 h-[520px] w-[520px] rounded-full border border-[#D7B982]/25" />
      <div className="absolute -right-16 -top-20 h-[360px] w-[360px] rounded-full border border-[#D7B982]/20" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:min-h-[560px] md:grid-cols-[1.06fr_.94fr] md:py-20 lg:gap-20">
        <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D7B982]/35 bg-[#F4E6CB]/10 px-3.5 py-2 text-[10px] font-bold tracking-[.12em] text-[#E8C886]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8C886]" />
            {premiumLabel(heroText(settings?.heroBadge, "Seçilmiş kalite · 1993'ten beri Bursa'dan"), "Seçilmiş Kalite · 1993'ten Beri Bursa'dan")}
          </p>
           <h1 className="max-w-[690px] font-display text-[clamp(3rem,7vw,6.25rem)] font-bold leading-[.91] tracking-[-.055em]">
            {title}
            <span className="mt-3 block text-[#E5B96F]">{subtitle}</span>
          </h1>
          <p className="mt-7 max-w-lg text-[15px] leading-7 text-[#D8D9D1] sm:text-base">{description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={primaryHref}
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#E5B96F] px-5 text-sm font-extrabold text-[#243B43] transition-transform hover:-translate-y-0.5 hover:bg-[#F0C986]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {primaryText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#E5B96F]/45 px-5 text-sm font-bold text-[#F4E6CB] transition-colors hover:border-[#E5B96F] hover:bg-[#E5B96F]/10"
            >
              {secondaryText}
            </Link>
          </div>
          <Link href="#homepage-video" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold tracking-[.12em] text-[#E8C886] transition-colors hover:text-white">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#E5B96F]/50 text-[10px]">▶</span>
            Marka Hikâyemizi Keşfedin
          </Link>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/15 pt-6">
            {stats.map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-[#F8F3EA]">{value}</p>
                <p className="mt-1 text-[10px] font-bold tracking-[.08em] text-[#B9C5C2]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="relative rounded-[2rem] border border-[#E7D9BF]/45 bg-[#F5EBDD] p-5 text-[#243B43] shadow-[0_28px_70px_rgba(7,20,23,.3)] sm:p-7">
            <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#D96C54] text-[#FFF3E6]">
              <PenLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="max-w-[220px]">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8A6D4A]">Bugünün seçimi</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[.95]">Ölç, seç, yenile.</h2>
              <p className="mt-3 text-xs leading-5 text-[#667276]">Evinizin ışığına ve tarzına uygun perdeler, tek yerde.</p>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2.5">
              {quickCategories.map(({ name, href, icon: Icon, tone }) => (
                <Link key={name} href={href} className={`flex min-h-[112px] flex-col justify-between rounded-2xl p-3 transition-transform hover:-translate-y-1 ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-extrabold">{name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#D8CBB9] bg-[#FBF8F2] px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[#C28A3D]">
                {[1, 2, 3, 4, 5].map((item) => <span key={item} className="text-sm">★</span>)}
                <strong className="ml-1 text-xs text-[#243B43]">4.9</strong>
              </div>
              <span className="text-[10px] font-bold text-[#667276]">10.000+ sipariş</span>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border border-[#D7B982]/30 bg-[#2E4D52] px-3.5 py-3 text-xs shadow-xl sm:flex">
            <Check className="h-4 w-4 text-[#8FD0B1]" aria-hidden="true" />
            <span><strong className="block text-[#F8F3EA]">Özenle paketlenir</strong><small className="text-[#B9C5C2]">Her sipariş bir emek</small></span>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#D7B982]/20 bg-[#1D3339]/80">
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#D7B982]/20 sm:px-6">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-2 py-2 sm:justify-center">
              <Icon className="h-5 w-5 shrink-0 text-[#E5B96F]" aria-hidden="true" />
              <span><strong className="block text-xs text-[#F8F3EA]">{title}</strong><small className="text-[11px] text-[#B9C5C2]">{text}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}