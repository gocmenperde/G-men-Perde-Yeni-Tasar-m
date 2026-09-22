"use client";

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { BRAND_IMAGES } from "@/lib/taxonomy-images";

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  comparePrice?: number | string | null;
  images?: string[];
  stock?: number;
};

type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  productCount: number;
  products: CatalogProduct[];
};

function money(value: unknown) {
  return `₺${Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr-TR");
}

function BrandLogo({ brand, large = false }: { brand: CatalogBrand; large?: boolean }) {
  const storedLogo = brand.logo?.trim() || null;
  const logo = storedLogo || BRAND_IMAGES[brand.slug];
  const fallbackLogo = storedLogo ? BRAND_IMAGES[brand.slug] : undefined;

  if (!logo) {
    return (
      <span className={`book-brand-logo book-brand-logo--initials ${large ? "book-brand-logo--large" : ""}`}>
        {initials(brand.name)}
      </span>
    );
  }

  return (
    <span className={`book-brand-logo ${large ? "book-brand-logo--large" : ""}`}>
      <ProductImage
        src={logo}
        fallbackSrc={fallbackLogo}
        alt={brand.name}
        fill
        unoptimized
        sizes={large ? "76px" : "42px"}
        className="object-contain"
        fallbackLabel=""
      />
    </span>
  );
}

function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const discount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} prefetch={false} className="book-brand-product">
      <span className="book-brand-product__image">
        {discount > 0 && <span className="book-brand-product__discount">-%{discount}</span>}
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 155px, 190px"
          className="object-contain p-4"
          fallbackLabel="Görsel hazırlanıyor"
        />
      </span>
      <span className="book-brand-product__name">{product.name}</span>
      <span className="book-brand-product__price">
        {product.comparePrice && <del>{money(product.comparePrice)}</del>}
        <strong>{money(product.price)}</strong>
      </span>
    </Link>
  );
}

export default function BrandCatalog({
  brands,
  title = "Perdede aradığın her şey.",
  subtitle = "Sevdiğin markayı seç, koleksiyonunu tek yerde keşfet.",
}: {
  brands: CatalogBrand[];
  title?: string;
  subtitle?: string;
}) {
  const visibleBrands = brands.filter((brand) => brand.products.length > 0);
  const [selectedSlug, setSelectedSlug] = useState(visibleBrands[0]?.slug ?? "");
  const brandRailRef = useRef<HTMLDivElement>(null);
  const productsRailRef = useRef<HTMLDivElement>(null);
  const selectedBrand = visibleBrands.find((brand) => brand.slug === selectedSlug) ?? visibleBrands[0];

  if (!visibleBrands.length || !selectedBrand) return null;

  const scrollRail = (rail: RefObject<HTMLDivElement | null>, direction: number, amount: number) => {
    rail.current?.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section id="marka-katalogu" className="book-brand-catalog" aria-label="Marka kataloğu">
      <div className="book-section-width">
        <div className="book-brand-catalog__heading">
          <div>
            <span className="book-kicker"><Sparkles size={13} aria-hidden="true" /> Marka kataloğu</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <span className="book-brand-catalog__stamp">GÖÇMEN<br />SEÇKİSİ</span>
        </div>

        <div className="book-brand-catalog__brands-wrap">
          <button
            type="button"
            className="book-brand-catalog__rail-arrow"
            onClick={() => scrollRail(brandRailRef, -1, 220)}
            aria-label="Önceki markalar"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <div className="book-brand-catalog__brands" ref={brandRailRef} role="tablist" aria-label="Markalar">
            {visibleBrands.map((brand) => (
              <button
                type="button"
                role="tab"
                aria-selected={selectedBrand.slug === brand.slug}
                aria-controls="brand-catalog-products"
                className={`book-brand-chip ${selectedBrand.slug === brand.slug ? "is-active" : ""}`}
                key={brand.id}
                onClick={() => setSelectedSlug(brand.slug)}
              >
                <BrandLogo brand={brand} />
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="book-brand-catalog__rail-arrow"
            onClick={() => scrollRail(brandRailRef, 1, 220)}
            aria-label="Sonraki markalar"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="book-brand-catalog__feature">
          <div className="book-brand-catalog__feature-copy">
            <span className="book-brand-catalog__feature-label">Şimdi seçili marka</span>
            <BrandLogo brand={selectedBrand} large />
            <h3>{selectedBrand.name}</h3>
            <p>{selectedBrand.productCount} ürünle markanın güncel kataloğunu incele.</p>
            <Link href={`/marka/${selectedBrand.slug}`} className="book-brand-catalog__link">
              Tüm ürünleri gör <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="book-brand-catalog__products-wrap">
            <button
              type="button"
              className="book-brand-catalog__product-arrow book-brand-catalog__product-arrow--left"
              onClick={() => scrollRail(productsRailRef, -1, 210)}
              aria-label="Önceki marka ürünleri"
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <div
              id="brand-catalog-products"
              className="book-brand-catalog__products"
              ref={productsRailRef}
              role="tabpanel"
              aria-label={`${selectedBrand.name} ürünleri`}
              key={selectedBrand.slug}
            >
              {selectedBrand.products.map((product) => (
                <CatalogProductCard product={product} key={product.id} />
              ))}
            </div>
            <button
              type="button"
              className="book-brand-catalog__product-arrow book-brand-catalog__product-arrow--right"
              onClick={() => scrollRail(productsRailRef, 1, 210)}
              aria-label="Sonraki marka ürünleri"
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}