import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Film, ArrowLeft, PlusCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation variant="public" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FFF1EE] border border-[#FF441F]/20 flex items-center justify-center text-[#FF441F] shadow-sm">
          <Film className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            That Reel isn&apos;t here.
          </h1>
          <p className="text-sm text-[#55524C] leading-relaxed">
            The page or Reel you are looking for may have been deleted, moved, or is private to another creator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/studio/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF441F] hover:bg-[#E63814] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Localize a New Reel</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
