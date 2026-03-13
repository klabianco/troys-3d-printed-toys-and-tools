import productsData from "@/data/products.json";

export interface Product {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  images: string[];
  price: number;
  stlFiles: string[];
  stlPrice: number;
  featured: boolean;
  inStock: boolean;
}

const products: Product[] = productsData;

export function getAllProducts(): Product[] {
  return products;
}

export function getBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}

export function getByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
