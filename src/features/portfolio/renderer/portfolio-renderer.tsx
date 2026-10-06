import React from "react";
import type {
  UnifiedPortfolioData,
  PublicPortfolioData,
  PublicProjectDetail,
} from "../types";
import { getTheme } from "../registry";

export interface PortfolioRendererProps {
  portfolio: UnifiedPortfolioData;
}

/**
 * Dynamic dispatcher accepting unified portfolio interface (works for both public and draft preview).
 * Automatically resolves theme with graceful fallback to Cinema.
 */
export function PortfolioRenderer({ portfolio }: PortfolioRendererProps) {
  const themeName = portfolio.settings?.theme;
  const theme = getTheme(themeName);
  const ThemeLayout = theme.component;

  return <ThemeLayout portfolio={portfolio as PublicPortfolioData} />;
}

export interface ProjectRendererProps {
  detail: PublicProjectDetail;
}

/**
 * Dynamic dispatcher for project detail / case-study view.
 */
export function ProjectRenderer({ detail }: ProjectRendererProps) {
  const themeName = detail.settings?.theme;
  const theme = getTheme(themeName);
  const ProjectPage = theme.projectComponent;

  return <ProjectPage {...detail} />;
}
