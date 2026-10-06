import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  boolean,
  timestamp,
  unique,
  check,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles";
import { mediaSourceTypeEnum } from "./enums";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description"),
    sourceType: mediaSourceTypeEnum("source_type").notNull(),
    sourceUrl: text("source_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    category: varchar("category", { length: 60 }).notNull(),
    client: varchar("client", { length: 80 }),
    year: smallint("year"),
    tools: text("tools")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    featured: boolean("featured").default(false).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("uq_profile_project_slug").on(table.profileId, table.slug),
    unique("uq_projects_id_profile").on(table.id, table.profileId),
    check(
      "chk_project_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
    ),
    check(
      "chk_project_year_range",
      sql`${table.year} IS NULL OR (${table.year} >= 1990 AND ${table.year} <= 2100)`
    ),
    check("chk_project_sort_order_positive", sql`${table.sortOrder} >= 0`),
    index("idx_projects_lookup").on(
      table.profileId,
      table.isPublished,
      table.sortOrder
    ),
    index("idx_projects_featured").on(table.profileId, table.featured),
  ]
);
