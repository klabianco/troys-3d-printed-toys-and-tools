import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const stripe = getStripe();
    const sessions = await stripe.checkout.sessions.list({
      status: "complete",
      limit: 100,
      expand: ["data.line_items"],
    });

    const orders = sessions.data.map((session) => {
      const colorSelections: Record<string, string> = {};
      if (session.metadata) {
        for (const [key, value] of Object.entries(session.metadata)) {
          if (key.startsWith("color_")) {
            colorSelections[key.replace("color_", "")] = value;
          }
        }
      }

      return {
        id: session.id,
        date: new Date(session.created * 1000).toISOString(),
        amount: session.amount_total,
        productName: session.line_items?.data[0]?.description ?? "Unknown",
        customerEmail: session.customer_details?.email ?? null,
        colorSelections,
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
