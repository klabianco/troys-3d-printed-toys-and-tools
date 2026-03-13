import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

const PRODUCTS_BLOB_KEY = "data/products.json";

async function readProducts() {
  try {
    const blob = await head(PRODUCTS_BLOB_KEY);
    const res = await fetch(blob.url);
    return await res.json();
  } catch {
    // Fall back to bundled products.json for initial data
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "src/data/products.json");
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
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
  });
  return NextResponse.json({ ok: true });
}
