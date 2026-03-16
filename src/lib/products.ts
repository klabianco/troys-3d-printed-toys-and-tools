import { head } from "@vercel/blob";
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
  colorParts?: string[];
}

const products: Product[] = productsData;

// Read products from Vercel Blob (admin-managed), falling back to bundled JSON
async function liveProducts(): Promise<Product[]> {
  try {
    const blob = await head("data/products.json");
    const res = await fetch(blob.url, { cache: "no-store" });
    return await res.json();
  } catch {
    return products;
  }
}

export async function getAllProductsLive(): Promise<Product[]> {
  return liveProducts();
}

export async function getBySlugLive(slug: string): Promise<Product | undefined> {
  const all = await liveProducts();
  return all.find((p) => p.slug === slug);
}

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

export async function getCategoriesLive(): Promise<string[]> {
  const all = await liveProducts();
  return [...new Set(all.map((p) => p.category))];
}

export async function getFeaturedProductsLive(): Promise<Product[]> {
  const all = await liveProducts();
  return all.filter((p) => p.featured);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
