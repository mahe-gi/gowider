import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    username: varchar("username", { length: 30 }).notNull().unique(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    headline: varchar("headline", { length: 120 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    location: varchar("location", { length: 80 }),
    availability: varchar("availability", { length: 60 }),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "chk_username_format",
      sql`${table.username} ~ '^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$'`
    ),
    check("chk_username_lowercase", sql`${table.username} = lower(${table.username})`),
  ]
);
