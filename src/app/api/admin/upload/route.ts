import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;

  if (!file || !slug) {
    return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${slug}${ext}`;

  const { url } = await put(`images/products/${filename}`, file, { access: "public", addRandomSuffix: false, allowOverwrite: true });

  return NextResponse.json({ path: url });
}
