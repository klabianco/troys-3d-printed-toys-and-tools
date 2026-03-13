import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Troy&apos;s 3D Prints
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
