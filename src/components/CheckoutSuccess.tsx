"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutSuccess({
  stlFiles,
  productName,
}: {
  stlFiles: string[];
  productName: string;
}) {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  if (checkout === "stl-success") {
    return (
      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-800">
          Payment successful! Your STL {stlFiles.length > 1 ? "files are" : "file is"} ready.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stlFiles.map((file) => {
            const name = file.split("/").pop() || "file.stl";
            return (
              <a
                key={file}
                href={file}
                download
                className="inline-block rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
              >
                Download {stlFiles.length > 1 ? name : `${productName} STL`}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (checkout === "success") {
    return (
      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-800">Order placed! Thanks for your purchase.</p>
        <p className="mt-1 text-sm text-emerald-700">You&apos;ll receive a confirmation email from Stripe shortly.</p>
      </div>
    );
  }

  return null;
}
