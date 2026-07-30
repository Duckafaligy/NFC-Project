import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";
import { shippingZones, tierRangeLabel, SHIPPING_UNITS } from "@/lib/shipping";
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
          Shipping is based on where your order is going and how much of a
          mailer it fills. Because several cards ship together, the rate steps
          up in brackets instead of charging full postage per card. You pick
          your region at checkout and the matching rate is applied
          automatically.
        </p>
        <p>
          The brackets below are counted in cards. An acrylic review stand is
          rigid and ships boxed, so it counts as {SHIPPING_UNITS.Stand} cards
          toward the bracket.
        </p>
        <div className="mt-1 space-y-4">
          {shippingZones.map((z) => (
            <div key={z.id}>
              <p className="font-semibold text-neutral-900">
                {z.label}{" "}
                <span className="font-normal text-neutral-400">
                  ({z.etaMin}–{z.etaMax} business days)
                </span>
              </p>
              <ul className="mt-1 space-y-1">
                {z.tiers.map((t, i) => {
                  const range = tierRangeLabel(z, i);
                  return (
                    <li key={t.minQty} className="flex justify-between gap-4">
                      <span>
                        {range} card{range === "1" ? "" : "s"}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(t.price)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection heading="Where we ship">
        <p>
          We ship within North America — Canada and the United States. For
          cross-border orders into the US, any customs fees or import taxes are
          the responsibility of the recipient.
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
