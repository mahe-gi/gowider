import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Learn about GoWider's refund policy, automated credit refund protection, and balance terms.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF441F] font-bold">
            Customer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Refund & Credit Policy
          </h1>
          <p className="text-sm text-[#8C877D] font-mono">
            Last updated: August 2026
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-6 text-sm text-[#55524C] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">1. Automated Failure Protection</h2>
            <p>
              If a localization job or specific language track fails during processing, reserved credits for that uncompleted track are automatically released back to your available wallet balance immediately. You will never be charged for an ungenerated video.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">2. Unused Credit Top-ups</h2>
            <p>
              If you purchased credits by mistake and have not used them for any generation runs, you may request a full refund within 7 days of payment by contacting our support team at <strong>support@gowider.com</strong> with your Razorpay payment ID.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#111111]">3. Quality Concerns</h2>
            <p>
              If a generated localization exhibits technical speech synthesis flaws, please reach out with your project ID. Our engineering team investigates quality reports and provides replacement credits where warranted.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
