import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users, projects } from "@/db/schema";
import { getUserWallet } from "@/lib/wallet/service";

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name must be at least 1 character.").max(60, "Display name must not exceed 60 characters."),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } }, { status: 401 });
    }

    const userId = session.user.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: { code: "USER_NOT_FOUND", message: "User record not found." } }, { status: 404 });
    }

    const wallet = await getUserWallet(userId);

    const [projectStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || session.user.name || "Creator",
        avatarUrl: user.avatarUrl || session.user.image,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        wallet: {
          balancePaise: wallet.balancePaise,
          reservedPaise: wallet.reservedPaise,
          availablePaise: wallet.availablePaise,
          formattedAvailableInr: wallet.formattedAvailableInr,
        },
        totalProjects: Number(projectStats?.count || 0),
      },
    });
  } catch (error: any) {
    console.error("GET /api/me error:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: error.message || "Failed to fetch profile." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { displayName } = validated.data;

    await db
      .update(users)
      .set({ displayName, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      data: { displayName },
    });
  } catch (error: any) {
    console.error("PATCH /api/me error:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: error.message || "Failed to update profile." } },
      { status: 500 }
    );
  }
}
