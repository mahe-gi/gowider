export const RESERVED_USERNAMES = new Set<string>([
  "about",
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "blog",
  "contact",
  "dashboard",
  "dev",
  "explore",
  "favicon",
  "feed",
  "gowider",
  "help",
  "home",
  "legal",
  "login",
  "logout",
  "moderation",
  "onboarding",
  "portfolio",
  "pricing",
  "privacy",
  "profile",
  "projects",
  "reelify",
  "register",
  "robots",
  "root",
  "search",
  "settings",
  "signin",
  "signout",
  "signup",
  "sitemap",
  "status",
  "support",
  "system",
  "terms",
  "user",
  "users",
  "verify",
  "welcome",
  "work",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}

export const USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
