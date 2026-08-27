export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "DROP IT",
      desc: "Upload your original Reel in MP4 or MOV. Up to 90 seconds.",
    },
    {
      num: "02",
      title: "CHOOSE",
      desc: "Select up to three Indian target languages with native scripts.",
    },
    {
      num: "03",
      title: "GO WIDER",
      desc: "Preview, stream, and download every localized video and subtitle file.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF441F] font-bold">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Three steps to every audience.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <span className="text-4xl font-extrabold font-serif italic text-[#FF441F]">
                {step.num}
              </span>
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">
                {step.title}
              </h3>
              <p className="text-sm text-[#55524C] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
