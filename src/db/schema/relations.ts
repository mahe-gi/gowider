import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
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

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(profiles, {
    fields: [user.id],
    references: [profiles.userId],
  }),
  resolvedReports: many(reports),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
  projects: many(projects),
  socialLinks: many(socialLinks),
  services: many(services),
  skills: many(skills),
  settings: one(portfolioSettings, {
    fields: [profiles.id],
    references: [portfolioSettings.profileId],
  }),
  subscription: one(subscriptions, {
    fields: [profiles.id],
    references: [subscriptions.profileId],
  }),
  reports: many(reports),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  profile: one(profiles, {
    fields: [subscriptions.profileId],
    references: [profiles.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [projects.profileId],
    references: [profiles.id],
  }),
  reports: many(reports),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [socialLinks.profileId],
    references: [profiles.id],
  }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  profile: one(profiles, {
    fields: [services.profileId],
    references: [profiles.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  profile: one(profiles, {
    fields: [skills.profileId],
    references: [profiles.id],
  }),
}));

export const portfolioSettingsRelations = relations(
  portfolioSettings,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [portfolioSettings.profileId],
      references: [profiles.id],
    }),
  })
);

export const reportsRelations = relations(reports, ({ one }) => ({
  profile: one(profiles, {
    fields: [reports.profileId],
    references: [profiles.id],
  }),
  project: one(projects, {
    fields: [reports.projectId],
    references: [projects.id],
  }),
  resolver: one(user, {
    fields: [reports.resolvedBy],
    references: [user.id],
  }),
}));
