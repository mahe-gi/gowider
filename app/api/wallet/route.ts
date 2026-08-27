import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserWallet } from "@/lib/wallet/service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "User not authenticated." } },
      { status: 401 }
    );
  }

  const wallet = await getUserWallet(session.user.id);
  return NextResponse.json({ success: true, data: wallet });
}
