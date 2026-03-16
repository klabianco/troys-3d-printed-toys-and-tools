import { notFound } from "next/navigation";
import { getAllProductsLive, getBySlugLive } from "@/lib/products";
import { Suspense } from "react";
import BuyButton from "@/components/BuyButton";
import ColorPartSelector from "@/components/ColorPartSelector";
import CheckoutSuccess from "@/components/CheckoutSuccess";
import DownloadButton from "@/components/DownloadButton";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await getAllProductsLive();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getBySlugLive(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Troy's 3D Prints`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getBySlugLive(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to Products
      </Link>

      <Suspense>
        <CheckoutSuccess stlFiles={product.stlFiles} productName={product.name} />
      </Suspense>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <ProductImage src={product.images[0]} alt={product.name} category={product.category} size="lg" />
        </div>

        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-4">
            {product.inStock ? (
              product.colorParts && product.colorParts.length > 0 ? (
                <ColorPartSelector
                  slug={product.slug}
                  price={product.price}
                  colorParts={product.colorParts}
                />
              ) : (
                <BuyButton slug={product.slug} price={product.price} />
              )
            ) : (
              <span className="rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500">
                Out of Stock
              </span>
            )}
            <DownloadButton
              slug={product.slug}
              stlFiles={product.stlFiles}
              stlPrice={product.stlPrice}
            />
          </div>

          {!product.inStock && (
            <p className="mt-3 text-sm text-gray-500">
              This item is currently out of stock, but you can still download the
              STL file to print your own.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
