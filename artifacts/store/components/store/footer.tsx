import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, ExternalLink, ArrowUpRight, Truck, LockKeyhole, Star } from "lucide-react";

interface FooterSettings {
  siteName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
}

const TRUST = [
  { icon: Truck, label: "Hızlı Teslimat",   sub: "Türkiye geneli" },
  { icon: LockKeyhole, label: "Güvenli Ödeme",    sub: "256-bit SSL" },
  { icon: Star, label: "4.9 Puan",          sub: "10.000+ yorum" },
];

const LINKS_SHOP = [
  { href: "/products",                    label: "Tüm Ürünler" },
  { href: "/products?featured=true",      label: "Öne Çıkanlar" },
   { href: "/products?sale=true",          label: "Kampanyalar" },
  { href: "/kategori/tul-perde",                label: "Tül Perdeler" },
  { href: "/kategori/fonperdeler",              label: "Fon Perdeler" },
  { href: "/kategori/stor-perde",               label: "Stor Perdeler" },
  { href: "/kategori/zebra-perde",              label: "Zebra Perdeler" },
  { href: "/kategori/plise-perde",              label: "Plise Perdeler" },
];

const LINKS_INFO = [
  { href: "/about",        label: "Hakkımızda" },
  { href: "/hikayemiz",    label: "Hikâyemiz" },
  { href: "/uygulama-ilham", label: "Uygulama & İlham" },
  { href: "/sizden-gelenler", label: "Sizden Gelenler" },
  { href: "/contact",      label: "İletişim" },
  { href: "/faq",          label: "Sık Sorulan Sorular" },
  { href: "/measure-guide", label: "Ölçü Rehberi" },
  { href: "/delivery",     label: "Teslimat Bilgileri" },
  { href: "/privacy",      label: "Gizlilik Politikası" },
  { href: "/terms",        label: "Kullanım Şartları" },
  { href: "/sales-policy", label: "Mesafeli Satış Sözleşmesi" },
];

export default function Footer({ settings }: { settings?: FooterSettings | null }) {
  const phone     = settings?.phone           ?? "0546 285 18 26";
  const email     = settings?.email           ?? "muhammedemint76@gmail.com";
  const address   = settings?.address         ?? "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A Osmangazi/Bursa";
  const whatsapp  = settings?.whatsapp        ?? "905462851826";
  const instagram = settings?.socialInstagram ?? "https://instagram.com";
  const siteName  = settings?.siteName        ?? "Göçmen Perde";

  const whatsappHref  = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  const instagramHref = instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram}`;
  const year = new Date().getFullYear();

  return (
     <footer className="bg-[#17282C] text-[#B7C5C1] selection:bg-amber-500/20 pb-mobile-nav">

      {/* ── Trust bar ── */}
       <div className="border-b border-white/10 bg-[#203B3F]">
         <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 group">
                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#E5B96F]/25 bg-[#17282C] transition-all duration-300 group-hover:border-[#E5B96F]/60 group-hover:bg-[#E5B96F]/10">
                   <Icon className="w-5 h-5 text-[var(--gold-light)]" aria-hidden="true" />
                </div>
                <div>
                   <p className="text-[12.5px] font-bold text-[#F5F0E8]">{label}</p>
                   <p className="text-[11px] font-medium text-[#A7B8B4]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
       <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-12 pt-14 sm:grid-cols-2 sm:px-6 md:grid-cols-4 md:gap-8">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
           <Link href="/" className="group mb-6 inline-flex flex-col leading-none">
             <span className="font-display text-[24px] font-bold tracking-tight text-[#F8F3EA] transition-colors duration-200 group-hover:text-[#E5B96F]">
              GÖÇMEN
            </span>
             <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[.28em] text-[#E5B96F]">
                Perde & Ev Tekstili
            </span>
          </Link>

           <p className="mb-6 max-w-[250px] text-[13px] leading-6 text-[#B7C5C1]">
             1993'ten bu yana Bursa Osmangazi'nin güvenilir perdecisi. Özel ölçü, profesyonel dikim ve montaj.
          </p>

          {/* Contact info */}
          <div className="space-y-2.5 mb-7">
            <a href={`tel:${phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-2.5 text-[12.5px] text-[#B7C5C1] transition-colors duration-200 hover:text-[#E5B96F]">
               <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#E5B96F] transition-colors group-hover:text-[#F0C986]" />
              {phone}
            </a>
            <a href={`mailto:${email}`}
                className="group flex items-center gap-2.5 text-[12.5px] text-[#B7C5C1] transition-colors duration-200 hover:text-[#E5B96F]">
               <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#E5B96F] transition-colors group-hover:text-[#F0C986]" />
              <span className="truncate">{email}</span>
            </a>
             <div className="flex items-start gap-2.5 text-[12px] text-[#A7B8B4]">
               <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#E5B96F]" />
              <span className="leading-relaxed">{address}</span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex gap-2">
            <a href={instagramHref} target="_blank" rel="noopener noreferrer"
               aria-label="Instagram"
               className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-600">
               <Instagram className="h-4 w-4 text-[#B7C5C1] transition-colors group-hover:text-white" />
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
               aria-label="WhatsApp"
               className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-[#25D366] group-hover:bg-[#25D366]">
               <svg className="h-4 w-4 text-[#B7C5C1] transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.506 5.823L0 24l6.335-1.483A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-4.988-1.364l-.358-.213-3.713.868.886-3.613-.235-.372A9.794 9.794 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
              </svg>
            </a>
            <a href="https://www.trendyol.com" target="_blank" rel="noopener noreferrer"
               aria-label="Trendyol"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-orange-400 group-hover:bg-orange-500">
               <ExternalLink className="h-3.5 w-3.5 text-[#B7C5C1] transition-colors group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div>
           <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#F5F0E8]">
            Alışveriş
          </h3>
          <ul className="space-y-2.5">
            {LINKS_SHOP.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}
                   className="group flex items-center gap-1.5 text-[13px] text-[#A7B8B4] transition-colors duration-200 hover:text-[#E5B96F]">
                  <span className="w-0 group-hover:w-3 h-px bg-amber-500 transition-all duration-300 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info links */}
        <div>
           <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#F5F0E8]">
            Bilgi
          </h3>
          <ul className="space-y-2.5">
            {LINKS_INFO.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}
                   className="group flex items-center gap-1.5 text-[13px] text-[#A7B8B4] transition-colors duration-200 hover:text-[#E5B96F]">
                  <span className="w-0 group-hover:w-3 h-px bg-amber-500 transition-all duration-300 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Map / address card */}
        <div>
           <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#F5F0E8]">
            Mağazamız
          </h3>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block mb-5"
          >
             <div className="relative h-[120px] overflow-hidden rounded-2xl border border-white/10 bg-[#203B3F] transition-all duration-300 group-hover:border-[#E5B96F]/40">
              {/* Static map placeholder */}
               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#29484B] to-[#17282C]">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                   <p className="text-[11px] font-medium text-[#C3D0CB]">Haritada Gör</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
                 <span className="text-[10px] font-medium text-white/85">Osmangazi, Bursa</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
          </a>

          {/* Hours */}
           <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-4">
             <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#F5F0E8]">Çalışma Saatleri</p>
            {[
              { day: "Pzt – Cum", hours: "09:00 – 18:00" },
              { day: "Cumartesi",  hours: "09:00 – 17:00" },
              { day: "Pazar",      hours: "Kapalı" },
            ].map(({ day, hours }) => (
              <div key={day} className="flex items-center justify-between">
                 <span className="text-[12px] text-[#A7B8B4]">{day}</span>
                 <span className={`text-[12px] font-bold ${hours === "Kapalı" ? "text-red-300" : "text-[#E6EEEA]"}`}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
       <div className="border-t border-white/10">
         <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
           <p className="text-[12px] text-[#A7B8B4]">
             © {year}{" "}
             <span className="font-semibold text-[#D8E1DD]">{siteName}</span>
            {" "}— Tüm hakları saklıdır.
             <span className="ml-2 text-[#6F8984]">EST. 1993 · Bursa, Türkiye</span>
          </p>
          {/* Payment logos */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
             <span className="mr-1 text-[11px] text-[#A7B8B4]">Ödeme:</span>
            {[
              { label: "Visa",       bg: "#1A1F71", text: "VISA",   textColor: "#fff" },
              { label: "Mastercard", custom: true },
              { label: "Troy",       bg: "#003087", text: "TROY",   textColor: "#fff" },
              { label: "PayTR",      bg: "#00A651", text: "PayTR",  textColor: "#fff" },
            ].map((card) =>
              card.custom ? (
                <div key="mastercard"
                  className="h-6 px-1.5 bg-white/8 border border-zinc-700/40 rounded-md flex items-center justify-center"
                  aria-label="Mastercard">
                  <svg viewBox="0 0 38 24" className="h-4" aria-label="Mastercard">
                    <circle cx="14" cy="12" r="10" fill="#EB001B"/>
                    <circle cx="24" cy="12" r="10" fill="#F79E1B"/>
                    <path d="M19 5.27a10 10 0 000 13.46A10 10 0 0019 5.27z" fill="#FF5F00"/>
                  </svg>
                </div>
              ) : (
                <div key={card.label}
                  className="h-6 px-2 border border-zinc-700/40 rounded-md flex items-center justify-center text-[9px] font-black tracking-wider"
                  style={{ backgroundColor: card.bg, color: card.textColor }}
                  aria-label={card.label}>
                  {card.text}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
