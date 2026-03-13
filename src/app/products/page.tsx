import CategoryFilter from "@/components/CategoryFilter";
import { getAllProducts, getCategories } from "@/lib/products";

export const metadata = {
  title: "Products — Troy's 3D Printed Toys & Tools",
  description: "Browse all 3D printed tools, toys, and gadgets.",
};

export default function ProductsPage() {
  const products = getAllProducts();
  const categories = getCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">All Products</h1>
      <CategoryFilter products={products} categories={categories} />
    </section>
  );
}
