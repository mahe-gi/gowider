import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service governing your use of GoWider's video localization platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF441F] font-bold">
            Legal Terms & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Terms of Service
          </h1>
          <p className="text-sm text-[#8C877D] font-mono">
            Last updated: August 2026 · Product & Legal Draft
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-[#FFF1EE] border border-[#FF441F]/20 text-xs text-[#991B00] leading-relaxed">
          <strong>Notice:</strong> This document represents a product-level operational terms draft. By accessing GoWider, you agree to these terms.
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-8 text-sm text-[#55524C] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">1. Agreement to Terms</h2>
            <p>
              By accessing, browsing, or using GoWider, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all terms, you must discontinue use immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">2. Voice Rights & Content Ownership Warranty</h2>
            <p>
              You expressly represent and warrant that you own or possess all necessary rights, licenses, and permissions for any video, audio, voice likeness, and script content you upload to GoWider.
            </p>
            <p className="pt-1">
              <strong>Strict Prohibition:</strong> You may not upload or localize third-party content, public figures, copyrighted media, or voices without explicit legal authorization. You remain solely responsible for the content you generate and publish.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">3. License to Process Content</h2>
            <p>
              You retain 100% intellectual property ownership of your original and localized videos. By submitting content, you grant GoWider a limited, non-exclusive, revocable license solely to extract audio, generate translations, synthesize speech tracks, and deliver finished video files back to you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">4. Software Credits & Pricing</h2>
            <p>
              GoWider operates as a digital Software-as-a-Service (SaaS) platform. Video localization and dubbing tasks consume digital software processing credits. Standard pricing is calculated based on input video duration and the number of target languages selected for rendering. Credits are allocated upon purchase and consumed when a localization rendering job completes.
            </p>
            <p className="pt-1">
              Payments for digital software credit packs are securely processed via Razorpay in Indian Rupees (INR). Purchased software credits are non-transferable and are used exclusively to access AI rendering compute on the GoWider platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">5. Prohibited Conduct</h2>
            <p>You agree not to use GoWider to:</p>
            <ul className="list-disc pl-5 space-y-1 pt-1">
              <li>Create deepfakes, deceptive impersonations, or misleading political or financial disinformation.</li>
              <li>Upload defamatory, obscene, harassing, hateful, or illegal content.</li>
              <li>Attempt to reverse engineer, disrupt, or overload the platform infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">6. Service Availability & Limitations</h2>
            <p>
              GoWider is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While we strive for high uptime and accurate voice-preserving localization, we do not guarantee uninterrupted availability or error-free outputs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">7. Contact & Inquiries</h2>
            <p>
              For legal notices or questions regarding these terms, please email <strong>{BRAND.legalEmail}</strong>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
