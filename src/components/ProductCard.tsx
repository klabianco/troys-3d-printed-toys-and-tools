import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square bg-gray-100">
        <ProductImage src={product.images[0]} alt={product.name} category={product.category} />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {product.category}
        </span>
        <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-emerald-600">
            Buy {formatPrice(product.price)}
          </span>
          <span className="text-sm font-medium text-sky-600">
            STL {product.stlPrice === 0 ? "Free" : formatPrice(product.stlPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
