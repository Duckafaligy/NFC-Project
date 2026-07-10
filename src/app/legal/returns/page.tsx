import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: `Return and refund policy for ${site.name}.`,
};

export default function ReturnsPage() {
  return (
    <LegalLayout title="Returns & Refunds" updated="July 2026">
      <p>
        We stand behind our products. If something isn&apos;t right, we&apos;ll
        make it right.
      </p>

      <LegalSection heading="Standard products">
        <p>
          Unused standard (non-custom) products can be returned within 30 days of
          delivery for a refund or replacement. The item must be in its original
          condition. Return shipping is the customer&apos;s responsibility unless
          the item arrived defective.
        </p>
      </LegalSection>

      <LegalSection heading="Custom products">
        <p>
          Because custom products are made specifically for you, they are not
          eligible for return unless they arrive defective or differ from the
          proof you approved. This is why we always send a proof for your
          approval before printing.
        </p>
      </LegalSection>

      <LegalSection heading="Defective or damaged items">
        <p>
          If your product arrives defective, damaged, or doesn&apos;t scan
          correctly, contact us within 14 days of delivery with a photo and
          we&apos;ll send a free replacement or issue a refund.
        </p>
      </LegalSection>

      <LegalSection heading="How to start a return">
        <p>
          Email{" "}
          <a href={`mailto:${site.email}`} className="font-bold text-ink underline">
            {site.email}
          </a>{" "}
          with your order number and the reason for the return. We&apos;ll reply
          with next steps.
        </p>
      </LegalSection>

      <LegalSection heading="Refund timing">
        <p>
          Approved refunds are issued to your original payment method and
          typically appear within 5-10 business days.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
