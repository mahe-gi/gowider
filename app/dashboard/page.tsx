import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { getUserWallet } from "@/lib/wallet/service";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PlusCircle, Wallet, Film, ArrowRight, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { HUMAN_STATUS_LABELS } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const userId = session.user.id;
  const userName = session.user.name || session.user.email?.split("@")[0] || "Creator";

  // 1. Fetch User Wallet
  const wallet = await getUserWallet(userId);

  // 2. Fetch User Projects (Latest 6)
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(6);

  // 3. Check for Active / Currently Processing Runs
  const activeProcessingProjects = userProjects.filter(
    (p) => p.status === "processing" || p.status === "uploading"
  );

  const completedProjects = userProjects.filter((p) => p.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation
        variant="app"
        user={session.user}
        walletBalancePaise={wallet.availablePaise}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#121212]/08">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Hello, {userName}
            </h1>
            <p className="text-sm text-[#55524C]">
              Welcome back to your GoWider creator workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#FF441F]" />
              <span>Localize a new Reel</span>
            </Link>
          </div>
        </div>

        {/* Operational Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Balance Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
                Available Credits
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-[#111111]">
                {wallet.formattedAvailableInr}
              </p>
              <p className="text-xs text-[#8C877D] mt-1">
                {wallet.reservedPaise > 0
                  ? `₹${(wallet.reservedPaise / 100).toFixed(0)} reserved in active runs`
                  : "Ready for your next localization"}
              </p>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF441F] hover:text-[#E63814] transition-colors"
            >
              <span>Add credits / view billing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Stats: Localized Projects */}
          <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
                Localized Reels
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-[#111111]">
                {userProjects.length}
              </p>
              <p className="text-xs text-[#8C877D] mt-1">
                {completedProjects.length} completed & ready to publish
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#55524C] hover:text-[#111111] transition-colors"
            >
              <span>View project library ({userProjects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Active Processing Section (if any) */}
        {activeProcessingProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF441F]" />
              <h2 className="text-lg font-bold text-[#111111]">Currently Processing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProcessingProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl bg-white border border-[#FF441F]/30 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 truncate">
                    <p className="text-sm font-bold text-[#111111] truncate">{project.displayName || "Untitled Reel"}</p>
                    <p className="text-xs text-[#FF441F] font-medium animate-pulse">
                      {HUMAN_STATUS_LABELS[project.status] || "Localizing your Reel…"}
                    </p>
                  </div>
                  <Link
                    href={`/project/${project.id}`}
                    className="px-4 py-2 rounded-full bg-[#FF441F] text-white text-xs font-bold shadow-xs hover:bg-[#E63814] transition-colors shrink-0"
                  >
                    View Status →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reels Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111111]">Recent Reels</h2>
            {userProjects.length > 0 && (
              <Link
                href="/projects"
                className="text-xs font-semibold text-[#55524C] hover:text-[#111111] transition-colors"
              >
                View all Reels ({userProjects.length}) →
              </Link>
            )}
          </div>

          {userProjects.length === 0 ? (
            /* Empty State for Brand-New User */
            <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#121212]/10 text-center space-y-5 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
                <Film className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold tracking-tight text-[#111111]">
                  Welcome to GoWider.
                </h3>
                <p className="text-sm text-[#55524C] leading-relaxed">
                  You haven&apos;t localized a Reel yet. Drop a short video to create your first multi-language versions with voice cloning.
                </p>
              </div>
              <Link
                href="/studio/new"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FF441F] hover:bg-[#E63814] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Localize your first Reel</span>
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

                        <span className="text-xs font-mono text-[#8C877D]">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
