"use client";

import { useEffect, useState, useRef } from "react";
import type { Product } from "@/lib/products";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [uploadingStl, setUploadingStl] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const stlInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const analyzeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => {
        if (r.ok) {
          setAuthenticated(true);
          return fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
        }
        setAuthenticated(false);
      });
  }, []);

  async function handleLogin() {
    setPinError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      setAuthenticated(true);
      fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
    } else {
      setPinError(true);
      setPin("");
    }
  }

  if (authenticated === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-xs text-center">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="mb-4 text-sm text-gray-500">Enter the admin code to continue.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="space-y-4"
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
              placeholder="------"
              autoFocus
              className={`w-full rounded-lg border px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono ${
                pinError ? "border-red-400 bg-red-50" : "border-gray-300"
              } focus:border-indigo-500 focus:outline-none`}
            />
            {pinError && (
              <p className="text-sm text-red-600">Incorrect code. Try again.</p>
            )}
            <button
              type="submit"
              disabled={pin.length === 0}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  function updateProduct(slug: string, field: keyof Product, value: unknown) {
    setProducts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, [field]: value } : p))
    );
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true);
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    });
    setSaving(false);
    setSaved(true);
  }

  function addProduct() {
    const name = prompt("Product name:");
    if (!name) return;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (products.some((p) => p.slug === slug)) {
      alert("A product with that name already exists.");
      return;
    }
    const category = prompt("Category (e.g. Tools, Toys, Gadgets):", "Tools") || "Tools";
    const newProduct: Product = {
      slug,
      name,
      description: "",
      shortDescription: "",
      category,
      images: [],
      price: 0,
      stlFiles: [],
      stlPrice: 0,
      featured: false,
      inStock: true,
      colorParts: [],
    };
    setProducts((prev) => [...prev, newProduct]);
    setSaved(false);
  }

  async function addFromPhoto(file: File) {
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/analyze", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to analyze image");
        setAnalyzing(false);
        return;
      }
      const newProduct: Product = await res.json();
      if (products.some((p) => p.slug === newProduct.slug)) {
        newProduct.slug = `${newProduct.slug}-${Date.now()}`;
      }
      const updated = [...products, newProduct];
      setProducts(updated);
      // Auto-save
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSaved(true);
    } catch {
      alert("Failed to analyze image. Please try again.");
    }
    setAnalyzing(false);
  }

  async function deleteProduct(slug: string) {
    const name = products.find((p) => p.slug === slug)?.name;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = products.filter((p) => p.slug !== slug);
    setProducts(updated);
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaved(true);
  }

  async function uploadImage(slug: string, file: File) {
    setUploading(slug);
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const { path } = await res.json();
    updateProduct(slug, "images", [path]);
    setUploading(null);
  }

  async function generateFromName(slug: string) {
    const product = products.find((p) => p.slug === slug);
    if (!product || !product.name.trim()) {
      alert("Enter a product name first.");
      return;
    }
    setGenerating(slug);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: product.name }),
      });
      if (!res.ok) {
        alert("Failed to generate details.");
        setGenerating(null);
        return;
      }
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.slug === slug
            ? {
                ...p,
                description: data.description,
                shortDescription: data.shortDescription,
                category: data.category,
                price: data.price,
                stlPrice: data.stlPrice,
              }
            : p
        )
      );
      setSaved(false);
    } catch {
      alert("Failed to generate details.");
    }
    setGenerating(null);
  }

  async function uploadStl(slug: string, file: File) {
    setUploadingStl(slug);
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const res = await fetch("/api/admin/upload-stl", { method: "POST", body: form });
    const { path } = await res.json();
    const product = products.find((p) => p.slug === slug);
    const existing = product?.stlFiles || [];
    updateProduct(slug, "stlFiles", [...existing, path]);
    setUploadingStl(null);
  }

  async function removeStlFile(slug: string, filePath: string) {
    const updated = products.map((p) =>
      p.slug === slug ? { ...p, stlFiles: p.stlFiles.filter((f) => f !== filePath) } : p
    );
    setProducts(updated);
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin — Manage Products</h1>
        <div className="flex gap-3">
          <button
            onClick={() => analyzeInputRef.current?.click()}
            disabled={analyzing}
            className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Add from Photo"}
          </button>
          <input
            ref={analyzeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addFromPhoto(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={addProduct}
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            + Add Manually
          </button>
          <button
            onClick={saveAll}
            disabled={saving || saved}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save All Changes"}
          </button>
        </div>
      </div>

      {analyzing && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span className="text-sm font-medium text-emerald-700">
            Analyzing photo with AI... This may take a few seconds.
          </span>
        </div>
      )}

      {products.length === 0 && !analyzing && (
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg">No products yet.</p>
          <p className="mt-1 text-sm">Use &quot;Add from Photo&quot; or &quot;+ Add Manually&quot; to get started.</p>
        </div>
      )}

      <div className="space-y-6">
        {products.map((product) => (
          <div
            key={product.slug}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-6">
              {/* Image section */}
              <div className="shrink-0">
                <div
                  className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-indigo-400"
                  onClick={() => fileInputRefs.current[product.slug]?.click()}
                >
                  {product.images[0] && !product.images[0].includes("placeholder") ? (
                    <>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                        <span className="text-xs font-medium text-white">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <span className="text-2xl">
                        {product.category === "Tools"
                          ? "\u{1F527}"
                          : product.category === "Toys"
                            ? "\u{1F3B2}"
                            : "\u{1F4F1}"}
                      </span>
                      <span className="mt-1 text-xs">Click to upload</span>
                    </div>
                  )}
                  {uploading === product.slug && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                  )}
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[product.slug] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(product.slug, file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.slug, "name", e.target.value)}
                    className="text-lg font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={product.category}
                    onChange={(e) => updateProduct(product.slug, "category", e.target.value)}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border-none focus:outline-none"
                  >
                    <option>Tools</option>
                    <option>Toys</option>
                    <option>Gadgets</option>
                  </select>
                  <button
                    onClick={() => generateFromName(product.slug)}
                    disabled={generating === product.slug}
                    className="ml-auto rounded px-2 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {generating === product.slug ? "Generating..." : "Autofill with AI"}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.slug)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Price (in dollars)
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={(product.price / 100).toFixed(2)}
                        onBlur={(e) =>
                          updateProduct(
                            product.slug,
                            "price",
                            Math.round(parseFloat(e.target.value || "0") * 100)
                          )
                        }
                        className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      STL Price (in dollars, 0 = free)
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={(product.stlPrice / 100).toFixed(2)}
                        onBlur={(e) =>
                          updateProduct(
                            product.slug,
                            "stlPrice",
                            Math.round(parseFloat(e.target.value || "0") * 100)
                          )
                        }
                        className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={product.shortDescription}
                    onChange={(e) =>
                      updateProduct(product.slug, "shortDescription", e.target.value)
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Full Description
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(product.slug, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={product.featured}
                      onChange={(e) =>
                        updateProduct(product.slug, "featured", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={(e) =>
                        updateProduct(product.slug, "inStock", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    In Stock
                  </label>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500">Color Parts:</label>
                    <button
                      onClick={() => {
                        const name = prompt("Part name (e.g. Top, Bottom, Body):");
                        if (!name?.trim()) return;
                        const existing = product.colorParts || [];
                        updateProduct(product.slug, "colorParts", [...existing, name.trim()]);
                      }}
                      className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      + Add Part
                    </button>
                  </div>
                  {product.colorParts && product.colorParts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.colorParts.map((part, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {part}
                          <button
                            onClick={() =>
                              updateProduct(
                                product.slug,
                                "colorParts",
                                (product.colorParts || []).filter((_, j) => j !== i)
                              )
                            }
                            className="ml-1 text-red-400 hover:text-red-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No color parts — customers won&apos;t pick colors</span>
                  )}
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500">STL Files:</label>
                    <button
                      onClick={() => stlInputRefs.current[product.slug]?.click()}
                      disabled={uploadingStl === product.slug}
                      className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploadingStl === product.slug ? "Uploading..." : "+ Add STL"}
                    </button>
                    <input
                      ref={(el) => { stlInputRefs.current[product.slug] = el; }}
                      type="file"
                      accept=".stl"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadStl(product.slug, file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  {product.stlFiles && product.stlFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.stlFiles.map((file) => (
                        <span
                          key={file}
                          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {file.split("/").pop()}
                          <button
                            onClick={() => removeStlFile(product.slug, file)}
                            className="ml-1 text-red-400 hover:text-red-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No STL files uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveAll}
          disabled={saving || saved}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
