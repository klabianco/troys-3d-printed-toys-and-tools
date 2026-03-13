import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";

const PRODUCTS_PATH = path.join(process.cwd(), "src/data/products.json");

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const data = await readFile(PRODUCTS_PATH, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await req.json();
  await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
  return NextResponse.json({ ok: true });
}
