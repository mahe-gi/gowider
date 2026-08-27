import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export function LanguageMarquee() {
  const languages = Object.values(SUPPORTED_LANGUAGES);

  return (
    <section id="languages" className="py-20 bg-[#FBF9F5] border-t border-[#121212]/05 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF441F] font-bold">
            Pan-India Reach
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Speak to more of India.
          </h2>
          <p className="text-sm text-[#55524C]">
            Support for 12 major Indian languages with native scripts and regional pronunciation models.
          </p>
        </div>

        {/* Interactive Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
          {languages.map((lang) => (
            <div
              key={lang.label}
              className="p-4 rounded-2xl bg-white border border-[#121212]/10 shadow-2xs hover:border-[#FF441F]/40 hover:shadow-xs transition-all text-center space-y-1"
            >
              <p className="text-xs font-medium text-[#8C877D]">{lang.label}</p>
              <p className="text-xl font-bold font-serif text-[#111111]">{lang.native}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
