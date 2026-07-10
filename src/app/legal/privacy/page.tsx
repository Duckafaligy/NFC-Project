import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${site.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains what information {site.name} collects, how
        we use it, and the choices you have. We keep data collection to the
        minimum needed to fulfil your orders and support you.
      </p>

      <LegalSection heading="1. Information we collect">
        <p>
          <strong>Order information:</strong> name, email, phone, shipping
          address, and business details you provide at checkout.
        </p>
        <p>
          <strong>Design content:</strong> artwork, logos, and notes you upload
          or send for custom products.
        </p>
        <p>
          <strong>Usage data:</strong> basic analytics such as pages visited and
          device type, used to improve the site.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <p>
          We use your information to process and ship orders, produce custom
          designs, provide customer support, send order updates, and comply with
          legal obligations. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sharing with third parties">
        <p>
          We share information only with service providers that help us operate —
          such as payment processors, shipping carriers, and print partners —
          and only as needed to fulfil your order.
        </p>
      </LegalSection>

      <LegalSection heading="4. Data retention & security">
        <p>
          We retain order records as required for accounting and legal purposes,
          and we use reasonable safeguards to protect your data. No method of
          transmission is 100% secure, but we work to protect your information.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, or delete your personal information. To make a request, email
          us at{" "}
          <a href={`mailto:${site.email}`} className="font-medium text-blue-700 underline">
            {site.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies">
        <p>
          We may use cookies and similar technologies to remember your cart and
          understand site usage. You can control cookies through your browser
          settings.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact">
        <p>
          Questions about your privacy? Email{" "}
          <a href={`mailto:${site.email}`} className="font-medium text-blue-700 underline">
            {site.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
