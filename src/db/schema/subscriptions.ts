import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" })
      .unique(),
    plan: varchar("plan", { length: 32 }).default("free").notNull(), // 'free' | 'pro'
    status: varchar("status", { length: 32 }).default("active").notNull(), // 'active' | 'authenticated' | 'past_due' | 'canceled' | 'halted'
    razorpayCustomerId: varchar("razorpay_customer_id", { length: 255 }),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
    razorpayPlanId: varchar("razorpay_plan_id", { length: 255 }),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "date",
    }),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "date",
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_subscriptions_profile_id").on(table.profileId),
    index("idx_subscriptions_status").on(table.status),
    index("idx_subscriptions_razorpay_sub").on(table.razorpaySubscriptionId),
  ]
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
