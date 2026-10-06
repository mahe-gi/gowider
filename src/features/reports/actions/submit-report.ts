"use server";

import { headers } from "next/headers";
import { eq, and, gt, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { profiles, projects, reports } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";
import { submitReportSchema, type SubmitReportSchema } from "../validation";
import { hashIpAddress, resolveClientIp } from "../ip-hash";

export async function submitReportAction(
  rawInput: SubmitReportSchema
): Promise<ActionResponse<{ reportId: string }>> {
  try {
    const validated = submitReportSchema.parse(rawInput);

    // 1. Resolve published profile
    const normalizedUsername = validated.username.trim().toLowerCase();
    const [targetProfile] = await db
      .select({
        id: profiles.id,
        isPublished: profiles.isPublished,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.username, normalizedUsername),
          eq(profiles.isPublished, true)
        )
      )
      .limit(1);

    if (!targetProfile) {
      throw AppError.notFound("Target portfolio not found or is not published.");
    }

    // 2. Resolve published project if specified
    let targetProjectId: string | null = null;
    if (validated.projectSlug) {
      const [targetProject] = await db
        .select({
          id: projects.id,
          isPublished: projects.isPublished,
        })
        .from(projects)
        .where(
          and(
            eq(projects.profileId, targetProfile.id),
            eq(projects.slug, validated.projectSlug),
            eq(projects.isPublished, true)
          )
        )
        .limit(1);

      if (!targetProject) {
        throw AppError.notFound("Target project not found or is not published.");
      }
      targetProjectId = targetProject.id;
    }

    // 3. Resolve IP and compute salted hash
    const headersList = await headers();
    const clientIp = resolveClientIp(headersList);
    const reporterIpHash = hashIpAddress(clientIp);

    // 4. Rate-limit check & insert inside transaction with pg_advisory_xact_lock
    const newReport = await db.transaction(async (tx) => {
      // Acquire transaction-level advisory lock on reporter_ip_hash
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${reporterIpHash}))`
      );

      // Count reports submitted from this IP hash in the last 1 hour
      const [rateCheck] = await tx
        .select({ count: count() })
        .from(reports)
        .where(
          and(
            eq(reports.reporterIpHash, reporterIpHash),
            gt(reports.createdAt, sql`now() - interval '1 hour'`)
          )
        );

      if (Number(rateCheck?.count || 0) >= 5) {
        throw AppError.rateLimited(
          "You have submitted multiple reports recently. Please try again later."
        );
      }

      const [inserted] = await tx
        .insert(reports)
        .values({
          reporterIpHash,
          profileId: targetProfile.id,
          projectId: targetProjectId,
          reason: validated.reason,
          description: validated.description?.trim() || null,
          status: "pending",
        })
        .returning({ id: reports.id });

      return inserted;
    });

    return actionSuccess({ reportId: newReport.id });
  } catch (error) {
    return actionError(error);
  }
}
