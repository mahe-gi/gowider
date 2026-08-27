import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Guest merge is deprecated in Auth-First V1 architecture.",
  });
}
