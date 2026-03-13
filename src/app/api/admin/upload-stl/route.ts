import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
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

  const dir = path.join(process.cwd(), "public/stl");
  await mkdir(dir, { recursive: true });

  // Keep the original filename
  const filename = file.name;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ path: `/stl/${filename}` });
}
