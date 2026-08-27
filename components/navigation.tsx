"use client";

import { useSession } from "next-auth/react";
import { PublicNavigation } from "./public-navigation";
import { AppNavigation } from "./app-navigation";

export interface NavigationProps {
  variant?: "public" | "app";
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  walletBalancePaise?: number;
  onOpenTopup?: () => void;
  onOpenAuth?: () => void;
}

export function Navigation({
  variant,
  user,
  walletBalancePaise,
  onOpenTopup,
  onOpenAuth,
}: NavigationProps) {
  const { data: session } = useSession();

  const isApp = variant === "app" || (variant === undefined && Boolean(user || session?.user));

  if (isApp) {
    return (
      <AppNavigation
        user={user}
        walletBalancePaise={walletBalancePaise}
        onOpenTopup={onOpenTopup}
      />
    );
  }

  return <PublicNavigation onOpenAuth={onOpenAuth} />;
}
