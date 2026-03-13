import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-indigo-600 py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          3D Printed Tools &amp; Toys
        </h1>
        <p className="mt-4 text-lg text-indigo-100">
          Practical tools, fun toys, and clever gadgets — all designed and 3D
          printed by Troy. Buy the finished product or download the STL file to
          print your own.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow hover:bg-indigo-50"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}
