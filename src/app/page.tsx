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
 * Homepage — a light, premium landing page for the NFC card brand, matching
 * the rest of the store. The header rides transparent over the hero and
 * solidifies on scroll (see components/Navbar).
 */
export default function HomePage() {
  return (
    <div className="bg-cream">
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
