import { HelpCircle } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function FaqSection() {
  const faqs = [
    {
      q: "What does GoWider do?",
      a: "GoWider allows video creators to turn one short video into multiple Indian-language versions while preserving their vocal identity, speech cadence, and timing.",
    },
    {
      q: "Which languages are currently supported?",
      a: "GoWider supports 12 languages: English, Hindi (हिन्दी), Bengali (বাংলা), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Odia (ଓଡ଼ିଆ), Punjabi (ਪੰਜਾਬੀ), Tamil (தமிழ்), Telugu (తెలుగు), and Assamese (অসমীয়া).",
    },
    {
      q: "What video formats and durations can I upload?",
      a: "You can upload vertical 9:16 videos in MP4 or MOV format up to 100MB in size and up to 90 seconds in duration.",
    },
    {
      q: "How many languages can I generate at once?",
      a: "You can select up to 3 target languages simultaneously per Reel localization.",
    },
    {
      q: "Will the localized version still sound like me?",
      a: "Yes. GoWider uses voice-preserving localization technology that retains your vocal identity, tone, and inflection in the translated audio tracks.",
    },
    {
      q: "What files do I receive when processing completes?",
      a: "You can download full 1080p (9:16) localized MP4 master videos with embedded audio and synchronized SRT subtitle files ready to publish to Instagram Reels and YouTube Shorts.",
    },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#FAF8F5] border-t border-[#121212]/08 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF441F] font-bold">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Everything you need to know.
          </h2>
          <p className="text-base text-[#55524C]">
            Clear answers about video limits, language support, and creator deliverables.
          </p>
        </div>

        {/* Semantic Accordion List using native details/summary */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-3xl bg-white border border-[#121212]/10 p-6 shadow-2xs transition-all duration-200 open:shadow-md open:border-[#FF441F]/30 select-none"
            >
              <summary className="flex items-center justify-between font-bold text-base sm:text-lg text-[#111111] cursor-pointer list-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF441F] rounded-xl pr-2">
                <span>{faq.q}</span>
                <span className="ml-4 shrink-0 w-8 h-8 rounded-full bg-[#F4F0E8] group-open:bg-[#FF441F] group-open:text-white flex items-center justify-center text-sm font-semibold transition-colors duration-200 text-[#111111]">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">&minus;</span>
                </span>
              </summary>
              <div className="pt-4 text-sm sm:text-base text-[#55524C] leading-relaxed border-t border-[#121212]/06 mt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* Support Note */}
        <div className="pt-6 text-center text-xs font-mono text-[#8C877D] flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#FF441F]" />
          <span>Have another question? Reach us at {BRAND.supportEmail}</span>
        </div>
      </div>
    </section>
  );
}
