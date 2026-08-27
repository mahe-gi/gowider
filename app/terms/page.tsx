import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">Terms of Service</h1>
          <p className="text-sm text-[#8C877D] font-mono">Last updated: August 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-6 text-sm text-[#55524C] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">1. Agreement to Terms</h2>
            <p>By accessing or using GoWider, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">2. Voice Rights & Content Ownership Warranty</h2>
            <p>You represent and warrant that you own or possess all necessary rights, licenses, and permissions for any voice, video, or audio content you upload and localize on GoWider. You agree not to upload content that infringes upon third-party copyrights, trademarks, or publicity rights.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">3. Credits & Service Delivery</h2>
            <p>Localization jobs are processed using pre-purchased credits. Credits are reserved when a localization job starts and settled upon successful generation of requested language tracks.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
