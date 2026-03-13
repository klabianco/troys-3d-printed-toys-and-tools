import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBySlug } from "@/lib/products";

export async function POST(req: NextRequest) {
  try {
    const { slug, type } = await req.json();

    const product = getBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isStl = type === "stl";

    if (!isStl && !product.inStock) {
      return NextResponse.json(
        { error: "Product out of stock" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isStl ? `${product.name} (STL File)` : product.name,
              description: isStl
                ? `STL file download for ${product.name}`
                : product.shortDescription,
            },
            unit_amount: isStl ? product.stlPrice : product.price,
          },
          quantity: 1,
        },
      ],
      success_url: isStl
        ? `${origin}/products/${product.slug}?checkout=stl-success`
        : `${origin}/products/${product.slug}?checkout=success`,
      cancel_url: `${origin}/products/${product.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
