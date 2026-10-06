"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";

export async function resolveReportAction(
  reportId: string,
  action: "dismiss" | "action_taken"
): Promise<ActionResponse<{ reportId: string; status: "resolved" | "dismissed" }>> {
  try {
    const { session } = await requireAdmin();

    const [existingReport] = await db
      .select({
        id: reports.id,
        status: reports.status,
      })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!existingReport) {
      throw AppError.notFound("Report not found");
    }

    const newStatus: "resolved" | "dismissed" =
      action === "dismiss" ? "dismissed" : "resolved";

    await db
      .update(reports)
      .set({
        status: newStatus,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      })
      .where(eq(reports.id, reportId));

    revalidatePath("/admin/reports");
    revalidatePath("/admin");

    return actionSuccess({ reportId, status: newStatus });
  } catch (error) {
    return actionError(error);
  }
}
