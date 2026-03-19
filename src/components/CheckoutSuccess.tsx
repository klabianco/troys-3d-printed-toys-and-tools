"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccess({
  stlFiles,
  productName,
}: {
  stlFiles: string[];
  productName: string;
}) {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (checkout === "success" && sessionId) {
      fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.colorSelections) {
            setColorSelections(data.colorSelections);
          }
        })
        .catch(() => {});
    }
  }, [checkout, sessionId]);

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
    const colorEntries = Object.entries(colorSelections);
    return (
      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-800">Order placed! Thanks for your purchase.</p>
        <p className="mt-1 text-sm text-emerald-700">You&apos;ll receive a confirmation email from Stripe shortly.</p>
        {colorEntries.length > 0 && (
          <div className="mt-3 text-sm text-emerald-700">
            <p className="font-medium">Selected colors:</p>
            <ul className="mt-1 list-inside list-disc">
              {colorEntries.map(([part, color]) => (
                <li key={part}>
                  {part}: {color}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}
