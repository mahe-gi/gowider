import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { mergeGuestProjectsToUser } from "@/lib/auth/merge";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
  }

  try {
    const result = await mergeGuestProjectsToUser(session.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error during guest merge:", error);
    return NextResponse.json(
      { error: { code: "MERGE_FAILED", message: error.message || "Failed to merge guest projects." } },
      { status: 500 }
    );
  }
}
