import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation variant="public" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF441F]" />
        <p className="text-xs font-mono text-[#8C877D]">Loading GoWider…</p>
      </main>
      <Footer />
    </div>
  );
}
