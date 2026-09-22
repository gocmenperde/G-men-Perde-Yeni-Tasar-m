import Link from "next/link";
import { ArrowRight, Camera, Heart, Ruler, Sparkles } from "lucide-react";
import {
  CurtainStorySection,
  CustomerProjectsSection,
  CustomerReviewsSection,
  InspirationSection,
} from "@/components/store/curtain-story-sections";
import type { HomepageSection } from "@/lib/homepage-config";

type EditorialPageKind = "inspiration" | "projects" | "story";

const sections: Record<EditorialPageKind, HomepageSection> = {
  inspiration: {
    id: "inspiration",
    label: "Uygulama & İlham Alanı",
    description: "Perde uygulamalarından ilham veren seçki",
    visible: true,
    title: "Yaşam alanınız için ilham",
    subtitle: "Farklı odalar ve pencere tipleri için tamamlanan perde uygulamalarına göz atın.",
    limit: 6,
    productIds: [],
    categorySlug: "",
  },
  projects: {
    id: "projects",
    label: "Sizden Gelenler",
    description: "Gerçek müşteri evlerinden uygulama fotoğrafları",
    visible: true,
    title: "Sizden Gelenler",
    subtitle: "Göçmen Perde uygulamaları sonrası paylaşılan gerçek müşteri fotoğrafları.",
    limit: 6,
    productIds: [],
    categorySlug: "",
  },
  story: {
    id: "story",
    label: "Hikâyemiz",
    description: "Göçmen Perde'nin Bursa'dan başlayan hikâyesi",
    visible: true,
    title: "Göçmen Perde: 30 yıllık bir hikâye",
    subtitle: "Bursa Osmangazi'nde başlayan perde deneyimimizi doğru ölçü, özenli dikim ve profesyonel montajla sürdürüyoruz.",
    limit: 1,
    productIds: [],
    categorySlug: "",
  },
};

const pageCopy = {
  inspiration: {
    eyebrow: "Perdeyi evinizde hayal edin",
    title: "Uygulama & İlham Alanı",
    description: "Gerçek mekânlardan perde seçimlerine bakın; salonunuz, yatak odanız ve gün ışığı alan pencereleriniz için fikir edinin.",
    icon: Sparkles,
  },
  projects: {
    eyebrow: "Gerçek evlerden",
    title: "Sizden Gelenler",
    description: "Ölçüden montaja tamamlanan projelerimizi ve müşterilerimizin yaşam alanlarına kattığımız dokunuşları keşfedin.",
    icon: Camera,
  },
  story: {
    eyebrow: "Bursa · Osmangazi · 1993'ten bugüne",
    title: "Hikâyemiz",
    description: "Bir mahalle mağazasında başlayan perde deneyimini bugün aynı özenle online alışverişe ve yaşam alanlarına taşıyoruz.",
    icon: Heart,
  },
} satisfies Record<EditorialPageKind, { eyebrow: string; title: string; description: string; icon: typeof Sparkles }>;

function PageHero({ kind }: { kind: EditorialPageKind }) {
  const copy = pageCopy[kind];
  const Icon = copy.icon;

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--cream)]">
      <div className="absolute -right-28 -top-36 h-[420px] w-[420px] rounded-full border border-[var(--gold-muted)]/35" />
      <div className="absolute -right-8 -top-16 h-[260px] w-[260px] rounded-full border border-[var(--gold-muted)]/25" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <span className="section-label inline-flex items-center gap-2">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[.95] tracking-[-.045em] text-[var(--navy)] sm:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--navy)] px-5 text-sm font-extrabold text-[var(--surface)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--gold)]">
              Perdeleri keşfet <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {kind !== "story" && (
              <Link href="/measure-guide" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] px-5 text-sm font-bold text-[var(--navy)] hover:border-[var(--gold-light)] hover:bg-[var(--surface)]">
                <Ruler className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
                Ölçü rehberi
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EditorialPage({ kind }: { kind: EditorialPageKind }) {
  const section = sections[kind];

  return (
    <div className="bg-[var(--cream)]">
      <PageHero kind={kind} />
      {kind === "inspiration" && (
        <>
          <InspirationSection section={section} />
          <CustomerProjectsSection section={sections.projects} />
        </>
      )}
      {kind === "projects" && (
        <>
          <CustomerProjectsSection section={section} />
          <CustomerReviewsSection section={{ ...sections.projects, title: "Müşterilerimiz Anlatıyor", subtitle: "Ölçüden montaja kadar yaşanan gerçek deneyimler.", limit: 3 }} />
        </>
      )}
      {kind === "story" && (
        <>
          <CurtainStorySection section={section} />
          <CustomerReviewsSection section={{ ...sections.projects, title: "Birlikte tamamladığımız evler", subtitle: "Doğru ölçü ve temiz montaj için bize güvenen müşterilerimiz.", limit: 3 }} />
        </>
      )}
    </div>
  );
}