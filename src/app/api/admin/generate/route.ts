import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const client = new OpenAI();
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Missing product name" }, { status: 400 });
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are writing product details for a 3D printed item called "${name}" for an online store called "Troy's 3D Printed Toys & Tools."

Return a JSON object with these fields:

- "description": A 2-3 sentence product description highlighting features and use cases
- "shortDescription": A brief tagline (under 10 words)
- "category": One of "Tools", "Toys", or "Gadgets" — pick the best fit
- "price": A reasonable price in cents for a 3D printed physical item (e.g. 1499 for $14.99). Base this on the item's likely size, complexity, and utility.
- "stlPrice": Price in cents for the STL file download (0 for free, or a reasonable price)

Return ONLY the JSON object, no markdown fences or other text.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 }
    );
  }
}
