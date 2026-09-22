import type { Metadata } from "next";
import EditorialPage from "@/components/store/editorial-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uygulama ve İlham Alanı | Göçmen Perde",
  description: "Göçmen Perde'nin gerçek mekânlardan perde uygulamaları ve dekorasyon ilhamları.",
  alternates: { canonical: "/uygulama-ilham" },
  openGraph: {
    title: "Uygulama ve İlham Alanı | Göçmen Perde",
    description: "Salon, yatak odası ve farklı pencere tipleri için perde uygulamalarını keşfedin.",
    url: "/uygulama-ilham",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Göçmen Perde Uygulama ve İlham Alanı" }],
  },
};

export default function InspirationPage() {
  return <EditorialPage kind="inspiration" />;
}