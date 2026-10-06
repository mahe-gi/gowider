export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Sign In with Google",
      desc: "One-click authentication via Google. No passwords to remember or accounts to verify. Your creator profile is created in seconds.",
      detail: "Google OAuth • Fast Onboarding",
    },
    {
      num: "02",
      title: "Paste Your Links",
      desc: "Add your YouTube commercial links, Instagram Reels, or private Google Drive review streams. Zero file uploads or transcoding waits.",
      detail: "YouTube • Instagram • Drive",
    },
    {
      num: "03",
      title: "Choose Your Style",
      desc: "Select between Cinema, Editorial, or Studio themes. Preview live draft updates in real time on mobile and desktop viewports.",
      detail: "Cinema • Editorial • Studio",
    },
    {
      num: "04",
      title: "Claim URL & Publish",
      desc: "Claim your memorable personal handle (gowider.in/yourname) and publish instantly. Zero setup fees or website maintenance.",
      detail: "Permanent Handle • Instant Live",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.08] bg-[#070707] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            06 // THE WORKFLOW
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            FROM WORK LINKS TO LIVE PORTFOLIO IN MINUTES
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            No complex drag-and-drop builders. No broken mobile formatting. Just clean presentation for your work.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 border border-white/[0.1] bg-black relative flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-4xl sm:text-5xl font-black text-zinc-700 block mb-6 select-none">
                  {step.num}
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.08]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
