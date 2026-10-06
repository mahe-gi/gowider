import type { PortfolioSettings } from "@/db/schema";
import type { PortfolioData } from "@/features/portfolio/types";

export type PortfolioSettingsItem = PortfolioSettings;
export type DraftPortfolioData = PortfolioData;

export interface UpdatePortfolioSettingsInput {
  theme: "cinema" | "editorial" | "studio";
  motionLevel: "full" | "reduced";
  accentColor: string;
}
