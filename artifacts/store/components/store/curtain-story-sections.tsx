"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, House, Quote, Ruler, Scissors, Sparkles, Star } from "lucide-react";
import type { HomepageSection } from "@/lib/homepage-config";

const PROJECT_IMAGES = [
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto6.jpg", alt: "Bursa salon perde uygulaması", label: "Salon uygulaması" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto8.jpg", alt: "Nilüfer zebra ve fon perde uygulaması", label: "Zebra & fon" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto11.jpg", alt: "Yatak odası perde dönüşümü", label: "Yatak odası" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto1.jpg", alt: "Çekirge fon perde uygulaması", label: "Fon perde" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto3.jpg", alt: "Görükle oturma odası uygulaması", label: "Oturma odası" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto5.jpg", alt: "Mudanya tül perde uygulaması", label: "Tül perde" },
];

const INSPIRATION_IMAGES = [
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto1.jpg", alt: "Salon tül perde uygulaması", label: "Salon tül" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto2.jpg", alt: "Zebra perde montajı", label: "Zebra sistem" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto9.jpg", alt: "Yatak odası fon perde uygulaması", label: "Fon kombin" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto10.jpg", alt: "Balkon plise perde uygulaması", label: "Plise alan" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto11.jpg", alt: "Ofis stor perde uygulaması", label: "Ofis stor" },
  { src: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto3.jpg", alt: "Çocuk odası perde uygulaması", label: "Çocuk odası" },
];

const REVIEWS = [
  {
    quote: "Ölçü alımı çok net yapıldı, tül perdeler pencerelere milimetrik oturdu. Montaj ekibi evi tertemiz bıraktı.",
    name: "Ayşe Yıldız",
    district: "Osmangazi",
    rating: 5,
  },
  {
    quote: "Kumaş seçerken çok yardımcı oldular. Salonumuz için önerdikleri fon perde beklediğimizden de güzel oldu.",
    name: "Mehmet Kaya",
    district: "Nilüfer",
    rating: 5,
  },
  {
    quote: "Başından sonuna kadar ilgili bir ekip. Zamanında teslim ve temiz montaj için teşekkür ederiz.",
    name: "Elif Demir",
    district: "Yıldırım",
    rating: 5,
  },
];

function ShowcaseImage({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#f7f2e8] via-[#efe5d5] to-[#e4d7c1] ${className ?? ""}`}
        role="img"
        aria-label={`${alt} — görsel şu anda kullanılamıyor`}
      >
        <div className="px-5 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#c9ad72]/50 bg-white/60 text-[#b8973e]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="mt-3 block text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8e7b5c]">
            Göçmen Perde
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}

function SectionHeading({ section, kicker }: { section: HomepageSection; kicker: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="section-label">{kicker}</span>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[.98] tracking-tight text-[var(--navy)] sm:text-5xl">
          {section.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">{section.subtitle}</p>
      </div>
    </div>
  );
}

export function CurtainStorySection({ section }: { section: HomepageSection }) {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--navy)] py-14 text-[#F8F3EA] sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
        <div>
          <span className="section-label !text-[#E5B96F]">Bursa · Osmangazi · 1993&apos;ten bugüne</span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[.98] tracking-tight sm:text-6xl">
            {section.title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#C9D3D0]">{section.subtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Ruler, title: "Doğru ölçü", text: "Yerinde keşif" },
              { icon: Scissors, title: "Özenli dikim", text: "Kaliteli işçilik" },
              { icon: House, title: "Temiz montaj", text: "Son kontrol" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
                <Icon className="mb-5 h-5 w-5 text-[#E5B96F]" aria-hidden="true" />
                <strong className="block text-sm">{title}</strong>
                <span className="mt-1 block text-xs text-[#AABAB6]">{text}</span>
              </div>
            ))}
          </div>
          <Link href="/hikayemiz" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[#E5B96F]">
            Hikâyemizi keşfedin <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#16252A] shadow-[0_24px_70px_rgba(0,0,0,.22)]">
          <ShowcaseImage
            src="https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto1.jpg"
            alt="Göçmen Perde'nin perde uygulamalarından bir görünüm"
            className="h-full min-h-[330px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#152429]/80 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-full border border-[#E5B96F]/40 bg-[#152429]/70 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#E5B96F]">
            GÖÇMEN PERDE
          </span>
        </div>
      </div>
    </section>
  );
}

export function CustomerProjectsSection({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-[var(--cream)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading section={section} kicker="Gerçek müşteri evleri" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {PROJECT_IMAGES.slice(0, section.limit).map((image, index) => (
            <figure key={image.src} className={`group relative overflow-hidden rounded-[1.35rem] bg-[var(--surface)] ${index === 0 ? "col-span-2 row-span-2 min-h-[340px] sm:min-h-[480px]" : "min-h-[170px] sm:min-h-[230px]"}`}>
              <ShowcaseImage
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17282C]/75 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-bold text-white">{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomerReviewsSection({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-[var(--surface-muted)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading section={section} kicker="Google yorumları" />
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.slice(0, section.limit).map((review) => (
            <article key={review.name} className="relative overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
              <Quote className="absolute right-5 top-5 h-12 w-12 text-[var(--gold-pale)]" aria-hidden="true" />
              <div className="relative">
                <div className="flex gap-1 text-[var(--gold)]" aria-label={`${review.rating} yıldız`}>
                  {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />)}
                </div>
                <p className="mt-6 min-h-32 font-display text-xl italic leading-8 text-[var(--navy)]">“{review.quote}”</p>
                <div className="mt-6 border-t border-[var(--line)] pt-4 text-[10px] font-extrabold uppercase tracking-[.2em] text-[var(--ink-muted)]">
                  {review.name} · {review.district}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InspirationSection({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-[var(--surface)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading section={section} kicker="Montaj projelerimiz" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INSPIRATION_IMAGES.slice(0, section.limit).map((image) => (
            <Link href="/products" key={image.src} className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-muted)]">
              <div className="aspect-[1.3/1] overflow-hidden">
                <ShowcaseImage
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <span className="flex items-center gap-2 text-sm font-extrabold text-[var(--navy)]"><Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />{image.label}</span>
                <ArrowRight className="h-4 w-4 text-[var(--gold)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}