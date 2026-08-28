import { NextResponse } from "next/server";
import { eq, desc, and, not, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, session.user.id),
        isNull(projects.deletedAt),
        not(eq(projects.status, "upload_pending"))
      )
    )
    .orderBy(desc(projects.createdAt));

  return NextResponse.json({
    success: true,
    data: userProjects,
  });
}
