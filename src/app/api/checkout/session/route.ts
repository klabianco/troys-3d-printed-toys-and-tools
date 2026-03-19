import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const colorSelections: Record<string, string> = {};
    if (session.metadata) {
      for (const [key, value] of Object.entries(session.metadata)) {
        if (key.startsWith("color_")) {
          colorSelections[key.replace("color_", "")] = value;
        }
      }
    }

    return NextResponse.json({ colorSelections });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
