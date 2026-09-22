import type { Metadata } from "next";
import EditorialPage from "@/components/store/editorial-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sizden Gelenler | Göçmen Perde",
  description: "Göçmen Perde müşterilerinin evlerinden gerçek perde uygulamaları.",
  alternates: { canonical: "/sizden-gelenler" },
  openGraph: {
    title: "Sizden Gelenler | Göçmen Perde",
    description: "Gerçek müşteri evlerinden perde uygulamalarını ve tamamlanan projeleri görün.",
    url: "/sizden-gelenler",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Göçmen Perde müşteri uygulamaları" }],
  },
};

export default function CustomerProjectsPage() {
  return <EditorialPage kind="projects" />;
}