import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const pin = decoded.split("-")[0];
    if (pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
