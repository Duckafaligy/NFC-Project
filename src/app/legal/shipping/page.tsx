import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";
import { shippingZones } from "@/lib/shipping";
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
          Shipping is a flat rate based on where your order is going. You pick
          your region at checkout and the matching rate is applied
          automatically:
        </p>
        <ul className="mt-1 space-y-1.5">
          {shippingZones.map((z) => (
            <li key={z.id} className="flex justify-between gap-4">
              <span>
                {z.label}{" "}
                <span className="text-neutral-400">
                  ({z.etaMin}–{z.etaMax} business days)
                </span>
              </span>
              <span className="font-semibold text-neutral-900">
                {formatPrice(z.rate)}
              </span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading="International shipping">
        <p>
          We currently ship to the United States, Canada, the United Kingdom,
          Australia, and New Zealand. Delivery times vary by destination, and
          any customs fees or import taxes are the responsibility of the
          recipient.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          Need an order by a specific date? Email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-neutral-900 underline">
            {site.email}
          </a>{" "}
          and we&apos;ll do our best to help.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
