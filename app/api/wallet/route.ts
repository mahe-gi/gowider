import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserWallet, seedDevCredits } from "@/lib/wallet/service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
  }

  const wallet = await getUserWallet(session.user.id);
  return NextResponse.json({ success: true, data: wallet });
}

// Dev/Testing Credit Seeding Endpoint
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const amountPaise = typeof body.amountPaise === "number" ? body.amountPaise : 50000; // Default ₹500

  const updatedWallet = await seedDevCredits(session.user.id, amountPaise);
  return NextResponse.json({ success: true, data: updatedWallet });
}
