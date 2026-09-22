import { catalogDb } from "@/lib/db";
import SearchClient from "./search-client";
import type { Metadata } from "next";

const BASE_URL = "https://www.gocmenkirtasiye.com.tr";

export const metadata: Metadata = {
  title: "Ürün Ara — Göçmen Perde",
  robots: { index: false, follow: true },
  // canonical eklenmezse Google "kullanıcı tarafından seçilen standart sayfa olmadan kopya" olarak işaretler.
  alternates: { canonical: `${BASE_URL}/products` },
};

export default async function SearchPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    [categories, brands] = await Promise.all([
      catalogDb.category.findMany({
        where: { parentId: null },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      }),
      catalogDb.brand.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch {}

  return (
    <SearchClient
      initialQuery={searchParams.q ?? ""}
      categories={categories}
      brands={brands}
    />
  );
}
