import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">Privacy Policy</h1>
          <p className="text-sm text-[#8C877D] font-mono">Last updated: August 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-6 text-sm text-[#55524C] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">1. Overview</h2>
            <p>GoWider is committed to protecting your privacy. This Privacy Policy explains how we collect, process, and safeguard your personal information, media uploads, and voice data when you use our video localization platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">2. Media & Voice Processing</h2>
            <p>When you upload video files (MP4/MOV) to GoWider, your media is stored securely in private cloud storage. Audio tracks are processed strictly for the purpose of speech synthesis, translation, and neural voice cadence matching into your requested target languages. Your original and localized media files are never shared publicly or used to train third-party foundational models without explicit authorization.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">3. Data Retention & Security</h2>
            <p>You maintain full ownership of your uploaded videos and localized outputs. You may delete your projects and associated media files at any time through your account workspace.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
