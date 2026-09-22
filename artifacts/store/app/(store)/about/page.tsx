"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Award, BookOpen, HeadphonesIcon, MapPin, Package, Phone, Shield, Star, Truck, Users } from "lucide-react";

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

const pillars = [
  { icon: Shield, title: "Seçerek sunarız", text: "Her ürünü kalite, kullanım alanı ve güvenilir marka ölçüsüyle değerlendiririz." },
  { icon: HeadphonesIcon, title: "İnsanla destekleriz", text: "Kararsız kaldığınızda doğru malzemeyi bulmanız için gerçek bir ekip yanınızdadır." },
  { icon: Award, title: "İyi yaşam alanlarına eşlik ederiz", text: "Doğru ölçüden özenli dikime ve temiz montaja kadar her adımı önemseriz." },
];

const contactLinks = [
  { icon: MapPin, title: "Mağazamız", text: "Osmangazi / Bursa", href: "https://maps.google.com/?q=Osmangazi+Bursa" },
  { icon: Phone, title: "Bizi arayın", text: "0546 285 18 26", href: "tel:+905462851826" },
];

export default function AboutPage() {
  return (
    <div className="bg-[var(--cream)] text-[var(--ink)]">
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-[var(--gold-muted)]/40" />
        <div className="absolute -right-16 -top-16 h-[270px] w-[270px] rounded-full border border-[var(--gold-muted)]/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <motion.div {...reveal()} className="grid items-end gap-10 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <span className="section-label">Osmangazi, Bursa · Est. 1993</span>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[.95] tracking-[-.045em] text-[var(--navy)] sm:text-7xl">
                Göçmen{" "}
                 <span className="text-[var(--gold)]">Perde</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
                Yalnızca ürün göndermiyoruz. İhtiyacı anlayıp doğru malzemeyi, doğru bilgiyle ve özenli bir deneyimle buluşturuyoruz.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--navy)] px-5 text-sm font-extrabold text-[var(--surface)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--gold)]">
                  Seçkileri keşfet <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] px-5 text-sm font-bold text-[var(--navy)] hover:border-[var(--gold-light)] hover:bg-[var(--surface)]">
                  Bize ulaşın
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--navy)] p-6 text-[#F8F3EA] shadow-[0_24px_70px_rgba(36,59,67,.18)] sm:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#E5B96F]/25" />
              <div className="relative">
                <span className="section-label !text-[#E5B96F]">Biz kimiz?</span>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">İyi fikirlerin başladığı yer.</h2>
                <p className="mt-4 text-sm leading-7 text-[#C9D3D0]">
                  Bursa&apos;da başlayan aile işletmesi deneyimimizi Türkiye&apos;nin her yerine taşıyoruz. Seçtiğimiz her ürün, daha iyi bir başlangıç için burada.
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-5">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E5B96F] text-[#243B43]"><BookOpen className="h-5 w-5" /></div>
                  <div><p className="text-sm font-extrabold">30+ yıllık deneyim</p><p className="mt-0.5 text-xs text-[#AABAB6]">Yerelden Türkiye&apos;ye</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div {...reveal()} className="mb-8 max-w-2xl">
          <span className="section-label">Farkımız</span>
          <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-.035em] text-[var(--navy)] sm:text-5xl">Perde alışverişini daha iyi hissettirmek.</h2>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <motion.article {...reveal(index * 0.08)} key={title} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 transition-transform hover:-translate-y-1 hover:border-[var(--gold-light)] hover:shadow-[var(--shadow-md)]">
              <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gold-pale)] text-[var(--gold)]"><Icon className="h-5 w-5" /></div>
              <h3 className="text-base font-extrabold text-[var(--navy)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-muted)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[var(--line)] sm:grid-cols-4">
          {[
            { icon: Package, value: "500+", label: "ürün seçeneği" },
            { icon: Users, value: "1.000+", label: "müşteri deneyimi" },
            { icon: Star, value: "4.9 / 5", label: "müşteri puanı" },
            { icon: Award, value: "30+", label: "yıllık uzmanlık" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center px-3 py-6 text-center sm:py-8">
              <Icon className="mb-3 h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
              <p className="font-display text-2xl font-bold text-[var(--navy)]">{value}</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <motion.div {...reveal()} className="rounded-[2rem] bg-[var(--navy)] p-7 text-[#F8F3EA] sm:p-10">
            <span className="section-label !text-[#E5B96F]">Hikâyemiz</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">Bir mahalle mağazasından, her yere ulaşan bir seçkiye.</h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-[#C9D3D0] sm:grid-cols-2">
              <p>Göçmen Perde, 1993 yılında Bursa Osmangazi&apos;nde küçük bir mağaza olarak başladı. Bugün aynı özeni online alışveriş deneyimine taşıyoruz.</p>
              <p>Evini yenilemek isteyen herkes için güvenilir kumaşları, doğru ölçüyü ve özenli işçiliği bir araya getiriyoruz.</p>
            </div>
          </motion.div>
          <motion.div {...reveal(0.08)} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 sm:p-8">
            <span className="section-label">Bize ulaşın</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-[var(--navy)]">Sorunuz mu var?</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Doğru ürünü seçmeniz için mağazadaki deneyimimizi bir mesaj kadar yakına taşıyoruz.</p>
            <div className="mt-6 space-y-3">
              {contactLinks.map(({ icon: Icon, title, text, href }) => (
                <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3 transition-colors hover:border-[var(--gold-light)] hover:bg-[var(--gold-pale)]/40">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold-pale)] text-[var(--gold)]"><Icon className="h-4 w-4" /></span>
                  <span><strong className="block text-xs font-extrabold text-[var(--navy)]">{title}</strong><small className="text-xs text-[var(--ink-muted)]">{text}</small></span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <motion.div {...reveal()} className="rounded-[2rem] bg-gradient-to-br from-[#1B3036] to-[#243B43] p-7 text-center text-[#F8F3EA] shadow-[0_24px_60px_rgba(36,59,67,.16)] sm:p-10">
          <span className="section-label justify-center !text-[#E5B96F]">Misyonumuz</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">Herkes için iyi malzemeye, iyi bir deneyimle ulaşmak.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#C9D3D0]">İhtiyacı anlayan, seçimi kolaylaştıran ve her siparişi özenle hazırlayan bir perde mağazası olmak.</p>
          <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E5B96F] text-xs font-black text-[#243B43]">ZT</div>
            <div><p className="text-sm font-extrabold">Zeynel Türkoğlu</p><p className="text-xs text-[#AABAB6]">Göçmen Perde</p></div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
