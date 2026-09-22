"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Layers3,
  PackageOpen,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import type { HomepageSection } from "@/lib/homepage-config";
import BannersClient, { type Banner } from "@/components/admin/banners-client";

export type { HomepageSection };

export type ProductOption = {
  id: string;
  name: string;
  slug: string;
  images?: string[];
  category?: { name?: string | null; slug?: string | null } | null;
  brand?: { name?: string | null } | null;
};

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  _count?: { products?: number };
};

const MAX_SEARCH_RESULTS = 8;
const MAX_PRODUCT_LIMIT = 48;

const inputClassName =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3.5 py-3 text-sm text-zinc-100 shadow-inner shadow-black/10 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";

const defaultCopy = [
  {
    match: /banner|kampanya|hero/i,
    title: "Sezonun seçtikleri",
    subtitle: "Mağazanızın öne çıkan fırsatlarını müşterilerinizle buluşturun.",
  },
  {
    match: /yeni|new/i,
    title: "Yeni gelenler",
    subtitle: "Raflara yeni eklenen ürünleri keşfedin.",
  },
  {
    match: /çok satan|bestseller|popular|popüler/i,
    title: "Çok satanlar",
    subtitle: "Müşterilerimizin en çok tercih ettiği ürünler.",
  },
  {
    match: /kategori|category/i,
    title: "İhtiyacınıza göre keşfedin",
    subtitle: "Perde koleksiyonunu kategorilere göre inceleyin.",
  },
];

function getDefaultCopy(section: HomepageSection) {
  const source = `${section.id} ${section.label} ${section.description}`;
  return (
    defaultCopy.find((item) => item.match.test(source)) ?? {
      title: section.label || "Ana sayfa bölümü",
      subtitle: section.description || "Ana sayfanız için seçtiğiniz ürünler.",
    }
  );
}

function getSearchText(product: ProductOption) {
  return [
    product.name,
    product.slug,
    product.category?.name,
    product.category?.slug,
    product.brand?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");
}

export default function HomepageEditor({
  sections,
  products,
  categories,
  productsLoading = false,
  categoriesLoading = false,
  bannerRecords = [],
  bannersLoading = false,
  onBannersChange,
  onChange,
}: {
  sections: HomepageSection[];
  products: ProductOption[];
  categories: CategoryOption[];
  productsLoading?: boolean;
  categoriesLoading?: boolean;
  bannerRecords?: Banner[];
  bannersLoading?: boolean;
  onBannersChange?: (banners: Banner[]) => void;
  onChange: (sections: HomepageSection[]) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    sections.length > 0 ? [sections[0].id] : [],
  );
  const [searchBySection, setSearchBySection] = useState<Record<string, string>>({});
  const [submittedSearchBySection, setSubmittedSearchBySection] = useState<Record<string, string>>({});
  const [categorySearchBySection, setCategorySearchBySection] = useState<Record<string, string>>({});
  const [submittedCategorySearchBySection, setSubmittedCategorySearchBySection] = useState<Record<string, string>>({});

  const productSearchIndex = useMemo(
    () =>
      products.map((product) => ({
        product,
        searchText: getSearchText(product),
      })),
    [products],
  );

  const visibleCount = sections.filter((section) => section.visible).length;
  const selectedCount = sections.reduce(
    (total, section) => total + section.productIds.length,
    0,
  );

  const updateSection = (
    sectionId: string,
    patch: Partial<HomepageSection>,
  ) => {
    onChange(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const nextSections = [...sections];
    [nextSections[index], nextSections[nextIndex]] = [
      nextSections[nextIndex],
      nextSections[index],
    ];
    onChange(nextSections);
  };

  const toggleExpanded = (sectionId: string) => {
    setExpandedIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  const setSearch = (sectionId: string, value: string) => {
    setSearchBySection((current) => ({ ...current, [sectionId]: value }));
  };

  const setCategorySearch = (sectionId: string, value: string) => {
    setCategorySearchBySection((current) => ({ ...current, [sectionId]: value }));
  };

  const selectProduct = (section: HomepageSection, productId: string) => {
    if (section.productIds.includes(productId)) return;
    updateSection(section.id, {
      productIds: [...section.productIds, productId],
    });
    setSearch(section.id, "");
    setSubmittedSearchBySection((current) => ({ ...current, [section.id]: "" }));
  };

  const removeProduct = (section: HomepageSection, productId: string) => {
    updateSection(section.id, {
      productIds: section.productIds.filter((id) => id !== productId),
    });
  };

  const submitSearch = (sectionId: string) => {
    setSubmittedSearchBySection((current) => ({
      ...current,
      [sectionId]: (searchBySection[sectionId] ?? "").trim(),
    }));
  };

  const submitCategorySearch = (sectionId: string) => {
    setSubmittedCategorySearchBySection((current) => ({
      ...current,
      [sectionId]: (categorySearchBySection[sectionId] ?? "").trim(),
    }));
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="flex flex-col gap-5 border-b border-zinc-800/90 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-500">
            <Layers3 className="h-3.5 w-3.5" />
            Vitrin düzeni
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Ana sayfa bölümleri
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Mağaza vitrininizin akışını, metinlerini ve ürün seçkisini teknik
            destek almadan düzenleyin.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 sm:self-auto">
          <div className="flex items-center gap-2 pr-3 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.12)]" />
            <span>
              <strong className="text-zinc-200">{visibleCount}</strong> /{" "}
              {sections.length} görünür
            </span>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="flex items-center gap-1.5 pl-3 text-xs text-zinc-500">
            <PackageOpen className="h-3.5 w-3.5 text-amber-500" />
            <span>
              <strong className="text-zinc-300">{selectedCount}</strong> ürün
            </span>
          </div>
        </div>
      </header>

      {sections.length === 0 ? (
        <div
          data-testid="empty-homepage-sections"
          className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 px-6 py-16 text-center"
        >
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-zinc-800 text-zinc-500">
            <Layers3 className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-200">
            Henüz düzenlenecek bölüm yok
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Ana sayfa bölümleri tanımlandığında bu alandan görünürlük ve sıra
            ayarlarını yönetebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isExpanded = expandedIds.includes(section.id);
            const copy = getDefaultCopy(section);
            const searchTerm = searchBySection[section.id] ?? "";
            const submittedSearchTerm = submittedSearchBySection[section.id] ?? "";
            const categorySearchTerm = categorySearchBySection[section.id] ?? "";
            const submittedCategorySearchTerm =
              submittedCategorySearchBySection[section.id] ?? "";
            const normalizedSearch = submittedSearchTerm.toLocaleLowerCase("tr-TR");
            const normalizedCategorySearch =
              submittedCategorySearchTerm.toLocaleLowerCase("tr-TR");
            const selectedIds = new Set(section.productIds);
            const searchResults =
              normalizedSearch.length < 2
                ? []
                : productSearchIndex
                    .filter(
                      ({ product, searchText }) =>
                        !selectedIds.has(product.id) &&
                        searchText.includes(normalizedSearch),
                    )
                    .slice(0, MAX_SEARCH_RESULTS)
                    .map(({ product }) => product);
            const categoryResults =
              normalizedCategorySearch.length < 2
                ? []
                : categories
                    .filter((category) =>
                      `${category.name} ${category.slug}`
                        .toLocaleLowerCase("tr-TR")
                        .includes(normalizedCategorySearch),
                    )
                    .slice(0, MAX_SEARCH_RESULTS);
            const selectedCategory = categories.find(
              (category) => category.slug === section.categorySlug,
            );

            return (
              <section
                key={section.id}
                data-testid={`homepage-section-${section.id}`}
                className={`overflow-hidden rounded-2xl border bg-zinc-900/80 shadow-lg shadow-black/5 transition-colors ${
                  section.visible
                    ? "border-zinc-700/90"
                    : "border-zinc-800 opacity-[0.82]"
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="hidden shrink-0 text-zinc-700 sm:block" aria-hidden="true">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-zinc-700 bg-zinc-950 text-xs font-black text-amber-500">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-white">
                          {section.label}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            section.visible
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                          data-testid={`status-section-${section.id}`}
                        >
                          {section.visible ? "Yayında" : "Gizli"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 sm:justify-end">
                    <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950/60 p-0.5">
                      <button
                        type="button"
                        data-testid={`button-move-up-${section.id}`}
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        aria-label={`${section.label} bölümünü yukarı taşı`}
                        title="Yukarı taşı"
                        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-amber-400 disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        data-testid={`button-move-down-${section.id}`}
                        onClick={() => moveSection(index, 1)}
                        disabled={index === sections.length - 1}
                        aria-label={`${section.label} bölümünü aşağı taşı`}
                        title="Aşağı taşı"
                        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-amber-400 disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      data-testid={`button-toggle-visibility-${section.id}`}
                      onClick={() =>
                        updateSection(section.id, { visible: !section.visible })
                      }
                      aria-pressed={section.visible}
                      className={`ml-2 flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors ${
                        section.visible
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                          : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {section.visible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {section.visible ? "Görünür" : "Gizli"}
                      </span>
                    </button>
                    <button
                      type="button"
                      data-testid={`button-expand-section-${section.id}`}
                      onClick={() => toggleExpanded(section.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${section.label} bölümünü ${isExpanded ? "kapat" : "aç"}`}
                      className="ml-1 grid h-9 w-9 place-items-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180 text-amber-400" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-800/90 bg-zinc-950/25 p-4 sm:p-5">
                    {section.id === "banner" ? (
                      <BannersClient
                        initial={bannerRecords}
                        embedded
                        loading={bannersLoading}
                        onBannersChange={onBannersChange}
                      />
                    ) : (
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
                          Bölüm ayarları
                        </div>

                        <div>
                          <label
                            htmlFor={`title-${section.id}`}
                            className="mb-1.5 block text-xs font-semibold text-zinc-400"
                          >
                            Başlık
                          </label>
                          <input
                            id={`title-${section.id}`}
                            data-testid={`input-title-${section.id}`}
                            value={section.title}
                            onChange={(event) =>
                              updateSection(section.id, {
                                title: event.target.value,
                              })
                            }
                            placeholder={copy.title}
                            className={inputClassName}
                          />
                          {!section.title && (
                            <p className="mt-1.5 text-[11px] text-zinc-600">
                              Varsayılan: {copy.title}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`subtitle-${section.id}`}
                            className="mb-1.5 block text-xs font-semibold text-zinc-400"
                          >
                            Açıklama
                          </label>
                          <textarea
                            id={`subtitle-${section.id}`}
                            data-testid={`input-subtitle-${section.id}`}
                            value={section.subtitle}
                            onChange={(event) =>
                              updateSection(section.id, {
                                subtitle: event.target.value,
                              })
                            }
                            placeholder={copy.subtitle}
                            rows={3}
                            className={`${inputClassName} resize-none leading-5`}
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`limit-${section.id}`}
                              className="mb-1.5 block text-xs font-semibold text-zinc-400"
                            >
                              Ürün limiti
                            </label>
                            <input
                              id={`limit-${section.id}`}
                              data-testid={`input-limit-${section.id}`}
                              type="number"
                              min={1}
                              max={MAX_PRODUCT_LIMIT}
                              inputMode="numeric"
                              value={section.limit}
                              onChange={(event) => {
                                const parsed = Number(event.target.value);
                                updateSection(section.id, {
                                  limit: Math.min(
                                    MAX_PRODUCT_LIMIT,
                                    Math.max(1, Number.isFinite(parsed) ? parsed : 1),
                                  ),
                                });
                              }}
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`category-${section.id}`}
                              className="mb-1.5 block text-xs font-semibold text-zinc-400"
                            >
                              Kategori seçimi
                            </label>
                            <select
                              id={`category-${section.id}`}
                              data-testid={`select-category-${section.id}`}
                              value={section.categorySlug}
                              onChange={(event) =>
                                updateSection(section.id, {
                                  categorySlug: event.target.value,
                                })
                              }
                              disabled={categoriesLoading}
                              className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <option value="">
                                {categoriesLoading
                                  ? "Kategoriler yükleniyor..."
                                  : "Otomatik kategori filtresi"}
                              </option>
                              {section.categorySlug && !selectedCategory && (
                                <option value={section.categorySlug}>
                                  Eski kayıt: {section.categorySlug}
                                </option>
                              )}
                              {categories.map((category) => (
                                <option key={category.id} value={category.slug}>
                                  {category.name} ({category.slug})
                                </option>
                              ))}
                            </select>
                            <div className="relative mt-2">
                              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                              <input
                                data-testid={`input-category-search-${section.id}`}
                                value={categorySearchTerm}
                                onChange={(event) =>
                                  setCategorySearch(section.id, event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    submitCategorySearch(section.id);
                                  }
                                }}
                                disabled={categoriesLoading}
                                placeholder="Kategori adı veya slug ara"
                                aria-label={`${section.label} kategorilerinde ara`}
                                className={`${inputClassName} pl-10 pr-16 disabled:cursor-not-allowed disabled:opacity-60`}
                              />
                              <button
                                type="button"
                                data-testid={`button-category-search-${section.id}`}
                                onClick={() => submitCategorySearch(section.id)}
                                disabled={categoriesLoading}
                                className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-zinc-800 px-2.5 text-[11px] font-bold text-amber-400 transition-colors hover:bg-zinc-700"
                              >
                                Ara
                              </button>
                            </div>
                            {selectedCategory && (
                              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-400">
                                <Tag className="h-3 w-3" />
                                Seçili: {selectedCategory.name}
                              </p>
                            )}
                            {categoryResults.length > 0 && (
                              <div
                                data-testid={`category-search-results-${section.id}`}
                                className="mt-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                              >
                                {categoryResults.map((category) => (
                                  <button
                                    type="button"
                                    key={category.id}
                                    data-testid={`button-select-category-${section.id}-${category.id}`}
                                    onClick={() => {
                                      updateSection(section.id, { categorySlug: category.slug });
                                      setCategorySearch(section.id, "");
                                      setSubmittedCategorySearchBySection((current) => ({
                                        ...current,
                                        [section.id]: "",
                                      }));
                                    }}
                                    className="flex w-full items-center justify-between gap-3 border-b border-zinc-800/80 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-amber-500/[0.07]"
                                  >
                                    <span className="min-w-0">
                                      <strong className="block truncate text-xs font-semibold text-zinc-200">
                                        {category.name}
                                      </strong>
                                      <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
                                        {category.slug}
                                      </span>
                                    </span>
                                    <span className="shrink-0 text-[10px] text-zinc-600">
                                      {category._count?.products ?? 0} ürün
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {normalizedCategorySearch.length >= 2 &&
                              categoryResults.length === 0 && (
                                <p className="mt-2 text-xs text-zinc-600">
                                  Eşleşen kategori bulunamadı.
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.045] px-3.5 py-3 text-xs leading-5 text-zinc-500">
                          Başlık ve açıklama boş bırakılırsa mağaza, bölümün
                          varsayılan metnini kullanır. Değişiklikler üst
                          formun state&apos;ine anında aktarılır.
                        </div>
                      </div>

                      <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/65 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                              <PackageOpen className="h-3.5 w-3.5 text-amber-500" />
                              Ürün seçkisi
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                              Bu bölümde göstermek istediğiniz ürünleri seçin.
                            </p>
                          </div>
                          <span className="shrink-0 self-start rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
                            {section.productIds.length} seçili
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                            <input
                              data-testid={`input-product-search-${section.id}`}
                              value={searchTerm}
                              onChange={(event) =>
                                setSearch(section.id, event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  submitSearch(section.id);
                                }
                              }}
                              disabled={productsLoading}
                              placeholder="Ürün adı, marka veya kategori ara"
                              aria-label={`${section.label} ürünlerinde ara`}
                              className={`${inputClassName} pl-10 pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
                            />
                            {searchTerm && (
                              <button
                                type="button"
                                data-testid={`button-clear-search-${section.id}`}
                                onClick={() => {
                                  setSearch(section.id, "");
                                  setSubmittedSearchBySection((current) => ({
                                    ...current,
                                    [section.id]: "",
                                  }));
                                }}
                                aria-label="Ürün aramasını temizle"
                                className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            data-testid={`button-product-search-${section.id}`}
                            onClick={() => submitSearch(section.id)}
                            className="shrink-0 rounded-xl bg-amber-500 px-3.5 text-xs font-black text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
                            disabled={productsLoading}
                          >
                            Ara
                          </button>
                        </div>

                        {productsLoading && (
                          <div
                            data-testid={`loading-products-${section.id}`}
                            className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3"
                          >
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                              <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500/50" />
                              Ürünler yükleniyor...
                            </div>
                          </div>
                        )}

                        {normalizedSearch.length > 0 &&
                          normalizedSearch.length < 2 && (
                            <p className="mt-2 text-xs text-zinc-600">
                              Aramayı görmek için en az 2 karakter yazın.
                            </p>
                          )}

                        {searchResults.length > 0 && (
                          <div
                            data-testid={`search-results-${section.id}`}
                            className="mt-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                          >
                            {searchResults.map((product) => (
                              <button
                                type="button"
                                key={product.id}
                                data-testid={`button-select-product-${section.id}-${product.id}`}
                                onClick={() => selectProduct(section, product.id)}
                                className="flex w-full items-center gap-3 border-b border-zinc-800/80 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-amber-500/[0.07]"
                              >
                                <ProductThumb product={product} />
                                <span className="min-w-0 flex-1">
                                  <strong className="block truncate text-xs font-semibold text-zinc-200">
                                    {product.name}
                                  </strong>
                                  <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
                                    {product.brand?.name ||
                                      product.category?.name ||
                                      product.slug}
                                  </span>
                                </span>
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-zinc-700 text-zinc-500">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            ))}
                            {searchResults.length === MAX_SEARCH_RESULTS && (
                              <p className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-600">
                                İlk {MAX_SEARCH_RESULTS} sonuç gösteriliyor. Daha
                                net bir arama deneyin.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-3">
                          <label
                            htmlFor={`product-picker-${section.id}`}
                            className="mb-1.5 block text-xs font-semibold text-zinc-400"
                          >
                            Tüm ürünlerden seç
                          </label>
                          <select
                            id={`product-picker-${section.id}`}
                            data-testid={`select-product-${section.id}`}
                            value=""
                            onChange={(event) => {
                              if (event.target.value) {
                                selectProduct(section, event.target.value);
                              }
                            }}
                            disabled={productsLoading || products.length === 0}
                            className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="">
                              {productsLoading
                                ? "Ürünler yükleniyor..."
                                : products.length
                                  ? "Listeden ürün seçin"
                                  : "Ürün bulunamadı"}
                            </option>
                            {products
                              .filter((product) => !selectedIds.has(product.id))
                              .map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                  {product.brand?.name ? ` · ${product.brand.name}` : ""}
                                </option>
                              ))}
                          </select>
                        </div>

                        {normalizedSearch.length >= 2 &&
                          searchResults.length === 0 && (
                            <div
                              data-testid={`empty-product-search-${section.id}`}
                              className="mt-2 rounded-xl border border-dashed border-zinc-800 px-4 py-5 text-center"
                            >
                              <Search className="mx-auto mb-2 h-4 w-4 text-zinc-700" />
                              <p className="text-xs font-semibold text-zinc-500">
                                Eşleşen ürün bulunamadı
                              </p>
                              <p className="mt-1 text-[11px] text-zinc-700">
                                Ürün adı, marka veya kategori adını kontrol edin.
                              </p>
                            </div>
                          )}

                        {section.productIds.length > 0 ? (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {section.productIds.map((productId) => {
                              const product = products.find(
                                (option) => option.id === productId,
                              );
                              return (
                                <div
                                  key={productId}
                                  data-testid={`selected-product-${section.id}-${productId}`}
                                  className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2"
                                >
                                  {product ? (
                                    <>
                                      <ProductThumb product={product} />
                                      <span className="min-w-0 flex-1">
                                        <strong className="block truncate text-xs font-semibold text-zinc-300">
                                          {product.name}
                                        </strong>
                                        <span className="mt-0.5 block truncate text-[10px] text-zinc-600">
                                          {product.category?.name ||
                                            product.brand?.name ||
                                            product.slug}
                                        </span>
                                      </span>
                                    </>
                                  ) : (
                                    <span className="flex min-w-0 flex-1 items-center gap-2 text-xs text-zinc-600">
                                      <PackageOpen className="h-4 w-4 shrink-0" />
                                      Ürün artık mevcut değil
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    data-testid={`button-remove-product-${section.id}-${productId}`}
                                    onClick={() => removeProduct(section, productId)}
                                    aria-label={`${product?.name ?? "Ürün"} seçkiden çıkar`}
                                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            data-testid={`empty-selected-products-${section.id}`}
                            className="mt-4 rounded-xl border border-dashed border-zinc-800 px-4 py-6 text-center"
                          >
                            <PackageOpen className="mx-auto mb-2 h-5 w-5 text-zinc-700" />
                            <p className="text-xs font-semibold text-zinc-500">
                              Henüz ürün seçilmedi
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-700">
                              Yukarıdaki alandan arayarak ekleyin.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {sections.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 px-3 text-center text-xs text-zinc-600">
          <Check className="h-3.5 w-3.5 text-emerald-500/80" />
          Değişiklikler otomatik olarak üst bileşene iletilir.
        </p>
      )}
    </div>
  );
}

function ProductThumb({ product }: { product: ProductOption }) {
  const image = product.images?.find((item) => Boolean(item));

  return image ? (
    <img
      src={image}
      alt=""
      data-testid={`img-product-${product.id}`}
      className="h-9 w-9 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 object-cover"
    />
  ) : (
    <span
      data-testid={`placeholder-product-${product.id}`}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-amber-500/80"
      aria-hidden="true"
    >
      <PackageOpen className="h-4 w-4" />
    </span>
  );
}