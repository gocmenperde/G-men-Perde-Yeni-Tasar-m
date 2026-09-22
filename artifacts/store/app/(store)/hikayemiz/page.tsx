import type { Metadata } from "next";
import EditorialPage from "@/components/store/editorial-page";

export const metadata: Metadata = {
  title: "Hikâyemiz | Göçmen Perde",
  description: "Göçmen Perde'nin 1993'ten bugüne Bursa Osmangazi'nde başlayan hikâyesi.",
  alternates: { canonical: "/hikayemiz" },
  openGraph: {
    title: "Hikâyemiz | Göçmen Perde",
    description: "1993'ten bugüne uzanan Göçmen Perde hikâyesini keşfedin.",
    url: "/hikayemiz",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Göçmen Perde Hikâyemiz" }],
  },
};

export default function StoryPage() {
  return <EditorialPage kind="story" />;
}