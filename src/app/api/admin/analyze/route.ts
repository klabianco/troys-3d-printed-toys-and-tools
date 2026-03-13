import { NextRequest, NextResponse } from "next/server";
import path from "path";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const client = new OpenAI();
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
          {
            type: "text",
            text: `You are analyzing a photo of a 3D printed item for an online store called "Troy's 3D Printed Toys & Tools."

Look at this image and determine what the 3D printed item is. Then return a JSON object with these fields:

- "name": A clear product name (e.g. "Articulated Dragon", "Cable Organizer Clips")
- "description": A 2-3 sentence product description highlighting features and use cases
- "shortDescription": A brief tagline (under 10 words)
- "category": One of "Tools", "Toys", or "Gadgets"
- "price": A reasonable price in cents for a 3D printed physical item (e.g. 1499 for $14.99). Base this on the item's size, complexity, and utility.
- "stlPrice": Price in cents for the STL download (0 for free, or a reasonable price)

Return ONLY the JSON object, no markdown fences or other text.`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  let productData;
  try {
    productData = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 }
    );
  }

  const slug = productData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Save the uploaded image to Vercel Blob
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${slug}${ext}`;
  const { url } = await put(`images/products/${filename}`, buffer, { access: "public" });

  return NextResponse.json({
    slug,
    name: productData.name,
    description: productData.description,
    shortDescription: productData.shortDescription,
    category: productData.category,
    images: [url],
    price: productData.price,
    stlFiles: [],
    stlPrice: productData.stlPrice,
    featured: false,
    inStock: true,
  });
}
