import HeroSection from "@/components/store/hero-section";
import FeaturedProducts from "@/components/store/featured-products";
import CategoryGrid from "@/components/store/category-grid";
import FlashSale from "@/components/store/flash-sale";
import NewArrivals from "@/components/store/new-arrivals";
import BrandSlider from "@/components/store/brand-slider";
import Testimonials from "@/components/store/testimonials";
import { db } from "@/lib/db";
export const revalidate = 60;
export default async function HomePage() {
  const [featuredProducts, categories, newProducts] = await Promise.all([
    db.product.findMany({ where: { isFeatured: true, isActive: true }, include: { brand: true, category: true }, take: 8, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ where: { parentId: null }, take: 6, orderBy: { name: "asc" } }),
    db.product.findMany({ where: { isActive: true }, include: { brand: true }, take: 8, orderBy: { createdAt: "desc" } }),
  ]);
  return <><HeroSection /><FeaturedProducts products={featuredProducts} /><CategoryGrid categories={categories} /><FlashSale /><NewArrivals products={newProducts} /><BrandSlider /><Testimonials /></>;
}
