import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation variant="app" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#121212]/08">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[#EADCC9]/50 rounded-xl" />
            <div className="h-4 w-72 bg-[#EADCC9]/30 rounded-lg" />
          </div>
          <div className="h-10 w-44 bg-[#EADCC9]/50 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 rounded-3xl bg-white border border-[#121212]/10 p-6 space-y-4" />
          <div className="h-44 rounded-3xl bg-white border border-[#121212]/10 p-6 space-y-4" />
        </div>

        <div className="space-y-4">
          <div className="h-6 w-36 bg-[#EADCC9]/50 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-52 rounded-3xl bg-white border border-[#121212]/10 p-6" />
            <div className="h-52 rounded-3xl bg-white border border-[#121212]/10 p-6" />
            <div className="h-52 rounded-3xl bg-white border border-[#121212]/10 p-6" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
