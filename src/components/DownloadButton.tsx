"use client";

import { useState } from "react";

export default function DownloadButton({
  slug,
  stlFiles,
  stlPrice,
}: {
  slug: string;
  stlFiles: string[];
  stlPrice: number;
}) {
  const [loading, setLoading] = useState(false);

  if (stlFiles.length === 0) return null;

  if (stlPrice === 0) {
    if (stlFiles.length === 1) {
      return (
        <a
          href={stlFiles[0]}
          download
          className="inline-block rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-600"
        >
          Download STL (Free)
        </a>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {stlFiles.map((file) => {
          const name = file.split("/").pop() || "file.stl";
          return (
            <a
              key={file}
              href={file}
              download
              className="inline-block rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-600"
            >
              {name} (Free)
            </a>
          );
        })}
      </div>
    );
  }

  async function handleBuyStl() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: "stl" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Checkout error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuyStl}
      disabled={loading}
      className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-600 disabled:opacity-50"
    >
      {loading
        ? "Loading..."
        : `Buy STL${stlFiles.length > 1 ? ` (${stlFiles.length} files)` : ""} ($${(stlPrice / 100).toFixed(2)})`}
    </button>
  );
}
