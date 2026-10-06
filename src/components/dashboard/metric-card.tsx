import React from "react";
import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  badge,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div
      data-testid="metric-card"
      className={clsx(
        "flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-5",
        className
      )}
    >
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-white">
          {value}
        </div>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      )}
    </div>
  );
}
