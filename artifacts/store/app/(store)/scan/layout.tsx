import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barkod Tara | Göçmen Kırtasiye",
  robots: { index: false, follow: false },
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}