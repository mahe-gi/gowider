export function TransformationSection() {
  return (
    <section className="py-20 border-t border-[#121212]/05 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Made once. <br />
            <span className="font-serif italic font-normal text-[#FF441F]">Understood everywhere.</span>
          </h2>
          <p className="text-base text-[#55524C]">
            One creator video seamlessly localized into Hindi, Tamil, Kannada and beyond, retaining your natural voice identity, cadence, and emotion.
          </p>
        </div>

        {/* Visual Transformation Graphic */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Source Box */}
          <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-sm space-y-2 text-center md:col-span-1">
            <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#F4F0E8] rounded-full text-[#8C877D]">
              SOURCE
            </span>
            <p className="text-xl font-bold font-serif text-[#111111]">తెలుగు (Telugu)</p>
            <p className="text-xs text-[#8C877D]">1 original Reel</p>
          </div>

          {/* Connector Arrow */}
          <div className="text-2xl font-bold text-[#FF441F] flex items-center justify-center font-mono">
            <span>⟶</span>
          </div>

          {/* Localized Outputs Array */}
          <div className="md:col-span-2 grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF441F]/30 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-[#FF441F]">Hindi</span>
              <p className="text-sm font-serif font-bold text-[#111111]">हिन्दी</p>
              <p className="text-[10px] text-[#8C877D] font-mono">Dubbed MP4</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF441F]/30 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-[#FF441F]">Tamil</span>
              <p className="text-sm font-serif font-bold text-[#111111]">தமிழ்</p>
              <p className="text-[10px] text-[#8C877D] font-mono">Dubbed MP4</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF441F]/30 shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-[#FF441F]">Kannada</span>
              <p className="text-sm font-serif font-bold text-[#111111]">ಕನ್ನಡ</p>
              <p className="text-[10px] text-[#8C877D] font-mono">Dubbed MP4</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
