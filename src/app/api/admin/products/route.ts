import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

const PRODUCTS_BLOB_KEY = "data/products.json";

async function readProducts() {
  try {
    const blob = await head(PRODUCTS_BLOB_KEY);
    const res = await fetch(blob.url, { cache: "no-store" });
    return await res.json();
  } catch {
    // Blob doesn't exist yet — seed it from the bundled products.json
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "src/data/products.json");
    const data = await readFile(filePath, "utf-8");
    const products = JSON.parse(data);
    // Persist to Blob so future saves work
    await put(PRODUCTS_BLOB_KEY, JSON.stringify(products, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return products;
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await readProducts();
  return NextResponse.json(products);
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await req.json();
  await put(PRODUCTS_BLOB_KEY, JSON.stringify(products, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return NextResponse.json({ ok: true });
}
