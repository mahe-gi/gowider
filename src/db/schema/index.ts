export * from "./enums";
export * from "./auth";
export * from "./profiles";
export * from "./projects";
export * from "./auxiliary";
export * from "./reports";
export * from "./subscriptions";
export * from "./relations";

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { user, session, account, verification } from "./auth";
import { profiles } from "./profiles";
import { projects } from "./projects";
import {
  socialLinks,
  services,
  skills,
  portfolioSettings,
} from "./auxiliary";
import { reports } from "./reports";
import { subscriptions } from "./subscriptions";

// Inferred TypeScript Model Types
export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type SocialLink = InferSelectModel<typeof socialLinks>;
export type NewSocialLink = InferInsertModel<typeof socialLinks>;

export type Service = InferSelectModel<typeof services>;
export type NewService = InferInsertModel<typeof services>;

export type Skill = InferSelectModel<typeof skills>;
export type NewSkill = InferInsertModel<typeof skills>;

export type PortfolioSettings = InferSelectModel<typeof portfolioSettings>;
export type NewPortfolioSettings = InferInsertModel<typeof portfolioSettings>;

export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;
