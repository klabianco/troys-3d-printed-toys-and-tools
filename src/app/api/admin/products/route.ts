import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

const PRODUCTS_BLOB_KEY = "data/products.json";

async function readFromBlob() {
  const blob = await head(PRODUCTS_BLOB_KEY);
  const res = await fetch(blob.url, { cache: "no-store" });
  return await res.json();
}

async function readFromFile() {
  const { readFile } = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "src/data/products.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data);
}

async function readProducts() {
  try {
    return await readFromBlob();
  } catch {
    // Blob not configured or not found — fall back to local file
  }
  return await readFromFile();
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to read products:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await req.json();

  // Try Blob first, fall back to local file
  try {
    await put(PRODUCTS_BLOB_KEY, JSON.stringify(products, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch {
    // Blob not configured — save to local file instead
    const { writeFile } = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "src/data/products.json");
    await writeFile(filePath, JSON.stringify(products, null, 2));
  }
  return NextResponse.json({ ok: true });
}
