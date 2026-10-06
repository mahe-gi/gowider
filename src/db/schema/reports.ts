import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  check,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";
import { profiles } from "./profiles";
import { projects } from "./projects";
import { reportReasonEnum, reportStatusEnum } from "./enums";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterIpHash: varchar("reporter_ip_hash", { length: 64 }).notNull(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id"),
    reason: reportReasonEnum("reason").notNull(),
    description: text("description"),
    status: reportStatusEnum("status").default("pending").notNull(),
    resolvedBy: uuid("resolved_by").references(() => user.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId, table.profileId],
      foreignColumns: [projects.id, projects.profileId],
      name: "fk_reports_project_profile",
    }).onDelete("no action"),
    check(
      "chk_report_resolution_consistency",
      sql`(${table.status} = 'pending' AND ${table.resolvedBy} IS NULL AND ${table.resolvedAt} IS NULL) OR (${table.status} IN ('resolved', 'dismissed') AND ${table.resolvedAt} IS NOT NULL)`
    ),
    index("idx_reports_moderation").on(table.status, table.createdAt),
    index("idx_reports_throttle").on(table.reporterIpHash, table.createdAt),
  ]
);
