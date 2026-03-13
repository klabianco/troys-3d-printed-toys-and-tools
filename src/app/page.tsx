import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import { getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          Featured Products
        </h2>
        <ProductGrid products={featured} />
      </section>
    </>
  );
}
