import type { ComponentType } from "react";
import type { PublicPortfolioData, PublicProjectDetail } from "./types";
import { CinemaLayout } from "./themes/cinema/cinema-layout";
import { CinemaProjectPage } from "./themes/cinema/cinema-project-page";
import { EditorialLayout } from "./themes/editorial/editorial-layout";
import { EditorialProjectPage } from "./themes/editorial/editorial-project-page";
import { StudioLayout } from "./themes/studio/studio-layout";
import { StudioProjectPage } from "./themes/studio/studio-project-page";
import { NoirLayout } from "./themes/noir/noir-layout";
import { NoirProjectPage } from "./themes/noir/noir-project-page";
import { VogueLayout } from "./themes/vogue/vogue-layout";
import { VogueProjectPage } from "./themes/vogue/vogue-project-page";

export interface ThemeRegistryEntry {
  id: string;
  name: string;
  isPro?: boolean;
  component: ComponentType<{ portfolio: PublicPortfolioData }>;
  projectComponent: ComponentType<PublicProjectDetail>;
}

export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  cinema: {
    id: "cinema",
    name: "Cinema",
    component: CinemaLayout,
    projectComponent: CinemaProjectPage,
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    component: EditorialLayout,
    projectComponent: EditorialProjectPage,
  },
  studio: {
    id: "studio",
    name: "Studio",
    component: StudioLayout,
    projectComponent: StudioProjectPage,
  },
  noir: {
    id: "noir",
    name: "Noir (Scope 2.39:1)",
    isPro: true,
    component: NoirLayout,
    projectComponent: NoirProjectPage,
  },
  vogue: {
    id: "vogue",
    name: "Vogue (Editorial Luxe)",
    isPro: true,
    component: VogueLayout,
    projectComponent: VogueProjectPage,
  },
};

export const DEFAULT_THEME = "cinema";

/**
 * Resolves theme definition by theme key, gracefully falling back to
 * Cinema if theme is unknown or not installed.
 */
export function getTheme(themeName?: string | null): ThemeRegistryEntry {
  if (!themeName || typeof themeName !== "string") {
    return THEME_REGISTRY[DEFAULT_THEME];
  }

  const normalized = themeName.toLowerCase().trim();
  return THEME_REGISTRY[normalized] || THEME_REGISTRY[DEFAULT_THEME];
}

/**
 * Returns the theme layout component for a given theme name,
 * with fallback to Cinema.
 */
export function getThemeComponent(
  themeName?: string | null
): ComponentType<{ portfolio: PublicPortfolioData }> {
  return getTheme(themeName).component;
}

/**
 * Returns the project detail page component for a given theme name,
 * with fallback to Cinema.
 */
export function getProjectThemeComponent(
  themeName?: string | null
): ComponentType<PublicProjectDetail> {
  return getTheme(themeName).projectComponent;
}
