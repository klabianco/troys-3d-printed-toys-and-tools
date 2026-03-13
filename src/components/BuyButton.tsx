"use client";

import { useState } from "react";

export default function BuyButton({ slug, price }: { slug: string; price: number }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
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
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? "Loading..." : `Buy Physical Print ($${(price / 100).toFixed(2)})`}
    </button>
  );
}
