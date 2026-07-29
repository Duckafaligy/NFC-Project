import { HeroScrub } from "@/components/home/HeroScrub";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DesignShowcase } from "@/components/home/DesignShowcase";
import {
  ComparisonStrip,
  PricingTiers,
  SocialProof,
  FinalCTA,
} from "@/components/home/HomeSections";
import { PreorderPopup } from "@/components/PreorderPopup";

/**
 * Homepage — a dark, premium landing page for the personalized NFC card
 * brand. Deliberately its own aesthetic: the rest of the store (catalog,
 * product pages, checkout) stays on the light theme. The header adapts to
 * this page automatically (see components/Navbar).
 */
export default function HomePage() {
  return (
    <div className="bg-neutral-950">
      {/* Live pre-order info modal (only while a product is on pre-order) */}
      <PreorderPopup />

      <HeroScrub />
      <HowItWorks />
      <DesignShowcase />
      <ComparisonStrip />
      <PricingTiers />
      <SocialProof />
      <FinalCTA />
    </div>
  );
}
