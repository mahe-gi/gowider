import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getProjectsForProfile } from "@/features/projects";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { QuickAddWork } from "@/components/dashboard/quick-add-work";
import { TypographicPoster } from "@/features/media";
import clsx from "clsx";

export default async function DashboardOverviewPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [projectsList, [settings]] = await Promise.all([
    getProjectsForProfile(profile.id),
    db
      .select()
      .from(portfolioSettings)
      .where(eq(portfolioSettings.profileId, profile.id))
      .limit(1),
  ]);

  const totalProjects = projectsList.length;
  const publishedProjects = projectsList.filter((p) => p.isPublished).length;
  const draftProjects = totalProjects - publishedProjects;
  const activeTheme = settings?.theme || "cinema";

  // Real Completeness Checklist
  const checklist = [
    {
      label: "Identity established",
      description: "Display name and headline set",
      isComplete: Boolean(profile.displayName && profile.headline),
      href: "/dashboard/profile",
    },
    {
      label: "Work showcased",
      description: "At least one project added to portfolio",
      isComplete: totalProjects > 0,
      href: "/dashboard/work/new",
    },
    {
      label: "Design configured",
      description: "Theme and presentation style selected",
      isComplete: Boolean(settings?.theme),
      href: "/dashboard/design",
    },
    {
      label: "Portfolio published",
      description: "Public link enabled for client viewing",
      isComplete: profile.isPublished,
      href: "/dashboard/settings",
    },
  ];

  const completedCount = checklist.filter((item) => item.isComplete).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  const recentProjects = projectsList.slice(0, 4);

  return (
    <div data-testid="dashboard-overview" className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {profile.displayName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your video projects, customize your design, and track your public portfolio.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/work/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <span>+</span>
            <span>Add Work</span>
          </Link>
        </div>
      </div>

      {/* Real Metrics Grid (Zero fake metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Projects"
          value={totalProjects}
          subtitle="All video works created"
        />
        <MetricCard
          label="Published Works"
          value={publishedProjects}
          subtitle="Visible on public page"
          badge={totalProjects > 0 ? `${Math.round((publishedProjects / totalProjects) * 100)}%` : undefined}
        />
        <MetricCard
          label="Drafts"
          value={draftProjects}
          subtitle="Private in-progress works"
        />
        <MetricCard
          label="Active Theme"
          value={activeTheme.toUpperCase()}
          subtitle={`${settings?.motionLevel || "full"} motion`}
        />
      </div>

      {/* Quick Add Work Bar */}
      <QuickAddWork />

      {/* Two Column Layout: Completeness Checklist & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checklist */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Setup Checklist</h2>
              <span className="text-xs font-mono text-zinc-400">
                {completionPercentage}% complete
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="mt-6 space-y-4">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      item.isComplete
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700/60"
                    )}
                  >
                    {item.isComplete ? "✓" : idx + 1}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={item.href}
                      className={clsx(
                        "text-sm font-medium transition",
                        item.isComplete
                          ? "text-zinc-300 hover:text-white"
                          : "text-zinc-200 hover:underline"
                      )}
                    >
                      {item.label}
                    </Link>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Preview public portfolio</span>
              <span>↗</span>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Projects</h2>
            {totalProjects > 0 && (
              <Link
                href="/dashboard/work"
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                View all ({totalProjects}) →
              </Link>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first video project to populate your portfolio showcase."
              actionText="Add First Project"
              actionHref="/dashboard/work/new"
            />
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center">
                      {project.thumbnailUrl ? (
                        <Image
                          src={project.thumbnailUrl}
                          alt={project.title}
                          fill
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="scale-[0.25] origin-center w-80 h-44 absolute">
                          <TypographicPoster
                            title={project.title}
                            category={project.category}
                            client={project.client}
                            year={project.year}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate max-w-xs">
                        {project.title}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {project.category} {project.client ? `• ${project.client}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        project.isPublished
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                      )}
                    >
                      {project.isPublished ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/dashboard/work/${project.id}/edit`}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition hover:bg-zinc-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
