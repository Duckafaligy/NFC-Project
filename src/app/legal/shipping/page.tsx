import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `Shipping information for ${site.name}.`,
};

export default function ShippingPage() {
  return (
    <LegalLayout title="Shipping Policy" updated="July 2026">
      <p>
        We want your NFC products in your hands fast. Here&apos;s how shipping
        works.
      </p>

      <LegalSection heading="Processing time">
        <p>
          Standard (non-custom) orders are processed and programmed within{" "}
          {site.shipping.handlingDays}. Custom orders enter production after you
          approve your design proof, then ship within {site.shipping.handlingDays}.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery time">
        <p>
          Estimated delivery is {site.shipping.deliveryDays} after your order
          ships, depending on your location and carrier. You&apos;ll receive
          tracking by email once it&apos;s on the way.
        </p>
      </LegalSection>

      <LegalSection heading="Shipping rates">
        <p>
          Flat-rate shipping is {formatPrice(site.shipping.flatRate)}. Orders
          over {formatPrice(site.shipping.freeThreshold)} ship free.
        </p>
      </LegalSection>

      <LegalSection heading="International shipping">
        <p>
          International delivery times and duties vary. Any customs fees or import
          taxes are the responsibility of the recipient.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          Need an order by a specific date? Email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-orange-700 underline">
            {site.email}
          </a>{" "}
          and we&apos;ll do our best to help.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
