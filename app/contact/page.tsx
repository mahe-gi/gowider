import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get in touch with GoWider support for inquiries, assistance, and feedback.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF441F] font-bold">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Contact Support
          </h1>
          <p className="text-sm text-[#55524C]">
            Have questions, feedback, or need help with your localized Reels? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111111]">Email Support</h2>
            <p className="text-xs text-[#55524C]">Reach our engineering and support team directly:</p>
            <p className="text-sm font-mono font-semibold text-[#111111]">support@gowider.com</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111111]">Creator Feedback</h2>
            <p className="text-xs text-[#55524C]">We welcome feature requests and output quality feedback.</p>
            <p className="text-sm font-mono font-semibold text-[#111111]">feedback@gowider.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
