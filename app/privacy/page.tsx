import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how GoWider collects, processes, and protects your personal information, media uploads, and voice data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF441F] font-bold">
            Legal & Data Practices
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#8C877D] font-mono">
            Last updated: August 2026 · Product & Legal Draft
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-[#FFF1EE] border border-[#FF441F]/20 text-xs text-[#991B00] leading-relaxed">
          <strong>Notice:</strong> This document represents a product-level operational draft outlining our technical data practices and privacy policies. It is subject to periodic review and updates.
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-8 text-sm text-[#55524C] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">1. Overview</h2>
            <p>
              GoWider (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) provides an automated video localization platform for creators. This Privacy Policy describes the types of information we collect, how we process and protect your media and voice data, and your rights regarding your data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">2. Information We Collect</h2>
            <p>We collect information necessary to provide and operate the localization service:</p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li><strong>Account Information:</strong> When you sign in via Google OAuth, we receive your name, email address, and Google profile image to manage your workspace and account credits.</li>
              <li><strong>Uploaded Media:</strong> Video and audio files (MP4/MOV) you upload for localization purposes.</li>
              <li><strong>Payment Metadata:</strong> When you purchase credits via Razorpay, we record the transaction amount, payment order ID, and credit balance. We never receive or store your credit card or banking details.</li>
              <li><strong>Technical & Session Identifiers:</strong> Ephemeral session cookies used strictly to manage guest uploads and authenticate logged-in sessions.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">3. Voice & Audio Processing</h2>
            <p>
              Audio extracted from your uploaded videos is processed strictly for the purpose of transcribing speech, translating content into your selected target languages, and synthesizing speech that preserves your vocal identity and cadence.
            </p>
            <p className="pt-1">
              Your audio files, transcripts, and localized outputs are processed securely and are never shared publicly or sold to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">4. Cloud Storage & Data Security</h2>
            <p>
              All original and localized media files are stored in private, access-controlled cloud object storage. Direct access URLs are cryptographically presigned and time-limited to ensure only authorized account holders can download or view generated media.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">5. Content Retention & Deletion</h2>
            <p>
              You maintain full control over your content. When you delete a Reel or project from your GoWider dashboard, all associated original videos, localized video files, and subtitle files are permanently purged from our private storage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">6. Cookies & Tracking</h2>
            <p>
              GoWider uses only strictly essential session cookies required for authentication and guest upload state management. We do not deploy third-party advertising trackers or invasive behavioral marketing cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">7. Third-Party Infrastructure Processors</h2>
            <p>
              We partner with trusted infrastructure providers to deliver our service:
            </p>
            <ul className="list-disc pl-5 space-y-1 pt-1">
              <li><strong>Cloud Storage & Compute:</strong> Cloudflare R2 and secure cloud compute for storage and processing.</li>
              <li><strong>Payment Processing:</strong> Razorpay Software Private Limited for secure credit top-up processing.</li>
              <li><strong>Authentication:</strong> Google OAuth for secure identity verification.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">8. User Rights & Contact</h2>
            <p>
              You have the right to access your stored account information, export your localized media files, and request full account or data deletion at any time. For questions regarding this policy, contact us at <strong>{BRAND.privacyEmail}</strong>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
