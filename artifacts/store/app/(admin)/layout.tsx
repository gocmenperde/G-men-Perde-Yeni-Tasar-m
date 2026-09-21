import type { Metadata } from "next";
import { getServerToken } from "@/lib/get-server-token";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token || token.role !== "ADMIN") redirect("/admin-giris");
  return <>{children}</>;
}
