import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Maintenance Policy",
  description: `Free maintenance and correction policy for ${site.name}.`,
};

export default function ReturnsPage() {
  return (
    <LegalLayout title="Maintenance Policy" updated="July 2026">
      <p>
        We stand behind our products. Instead of refunds, every order comes
        with {site.guaranteeDays} days of free maintenance: if something
        isn&apos;t right, we correct it at no cost.
      </p>

      <LegalSection heading="No refunds">
        <p>
          All sales are final. We do not offer refunds on standard or custom
          products. What we offer instead is the free maintenance window
          described below, plus a lifetime scanning replacement.
        </p>
      </LegalSection>

      <LegalSection heading={`First ${site.guaranteeDays} days: free maintenance`}>
        <p>
          For {site.guaranteeDays} days from delivery, we fix any problem with
          your product free of charge. That covers cards that don&apos;t scan,
          point to the wrong link, arrive damaged, or differ from the proof
          you approved. You can either ship the product back to us and we
          correct it and return it, or, where we offer it, we come out to your
          business and correct it on site.
        </p>
      </LegalSection>

      <LegalSection heading="Custom products">
        <p>
          Custom products are made specifically for you, which is why we
          always send a digital proof for your approval before printing. If
          the delivered product differs from the approved proof, that is
          covered by free maintenance: we correct and reprint it at no cost.
        </p>
      </LegalSection>

      <LegalSection heading="If it ever stops scanning">
        <p>
          Independent of the {site.guaranteeDays}-day window: if a card or tag
          stops scanning under normal use, contact us and we&apos;ll send a
          free replacement.
        </p>
      </LegalSection>

      <LegalSection heading="How to request maintenance">
        <p>
          Email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-neutral-900 underline">
            {site.email}
          </a>{" "}
          with your order number, a short description of the problem, and a
          photo if possible. We&apos;ll reply with next steps: a prepaid
          shipping label to send it back, or a time to come out and correct it
          in person.
        </p>
      </LegalSection>

      <LegalSection heading="Turnaround">
        <p>
          Shipped-back corrections are typically fixed and on their way back
          to you within 3-5 business days of arriving. On-site corrections are
          scheduled within the same week where available.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
