import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = Buffer.from(`${process.env.ADMIN_PIN}-${Date.now()}`).toString("base64");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const pin = decoded.split("-")[0];
    if (pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
