import { Hero } from "@/components/marketing/hero";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";
import { ScatteredReality } from "@/components/marketing/scattered-reality";
import { SupportedSources } from "@/components/marketing/supported-sources";
import { ThemeSwitcher } from "@/components/marketing/theme-switcher";
import { CreatorShowcase } from "@/components/marketing/creator-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingCard } from "@/components/marketing/pricing-card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaBanner } from "@/components/marketing/cta-banner";

export default function MarketingHomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <InteractiveDemo />
      <ScatteredReality />
      <SupportedSources />
      <ThemeSwitcher />
      <CreatorShowcase />
      <HowItWorks />
      <PricingCard />
      <FaqAccordion />
      <CtaBanner />
    </div>
  );
}
