import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc, and, not, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { getUserWallet } from "@/lib/wallet/service";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PlusCircle, Film, ArrowRight, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { HUMAN_STATUS_LABELS } from "@/lib/constants";
import { ReelCardMenu } from "@/components/reel-card-menu";

export default async function ProjectsLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/projects");
  }

  const userId = session.user.id;
  const wallet = await getUserWallet(userId);

  const userProjects = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
        not(eq(projects.status, "upload_pending"))
      )
    )
    .orderBy(desc(projects.createdAt));

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation
        variant="app"
        user={session.user}
        walletBalancePaise={wallet.availablePaise}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#121212]/08">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
              My Localized Reels
            </h1>
            <p className="text-sm text-[#55524C]">
              All your multi-language video localization projects ({userProjects.length}).
            </p>
          </div>

          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF441F] hover:bg-[#E63814] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Localize New Reel</span>
          </Link>
        </div>

        {userProjects.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#121212]/10 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
              <Film className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#111111]">No localized Reels yet</h3>
              <p className="text-sm text-[#55524C]">
                Turn your first short video into multiple Indian languages with voice cloning.
              </p>
            </div>
            <Link
              href="/studio/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              <span>Localize a Reel</span>
              <ArrowRight className="w-4 h-4 text-[#FF441F]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => {
              const statusLabel = HUMAN_STATUS_LABELS[project.status] || project.status;
              const isCompleted = project.status === "completed";
              const isFailed = project.status === "failed";
              const isProcessing = project.status === "processing" || project.status === "uploading";

              let actionLabel = "Open Studio";
              if (isCompleted) actionLabel = "View Results";
              else if (isProcessing) actionLabel = "View Progress";
              else if (project.status === "draft") actionLabel = "Continue Setup";

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="p-6 rounded-3xl bg-white border border-[#121212]/10 hover:border-[#FF441F]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                            : isFailed
                            ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                            : isProcessing
                            ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]"
                            : "bg-[#F4F0E8] text-[#8C877D]"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isFailed ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : isProcessing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{statusLabel}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#8C877D]">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <ReelCardMenu
                          projectId={project.id}
                          reelName={project.displayName || "Untitled Reel"}
                          isProcessing={isProcessing}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#FF441F] transition-colors truncate">
                      {project.displayName || "Untitled Reel"}
                    </h3>

                    <p className="text-xs text-[#55524C] font-mono">
                      {project.sourceLanguage || "Original"} ⟶{" "}
                      {(project.targetLanguages || []).join(", ") || "3 targets"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#121212]/05 flex items-center justify-between text-xs font-semibold text-[#FF441F]">
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
