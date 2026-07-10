import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${site.name}.`,
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 2026">
      <p>
        Welcome to {site.name}. By accessing our website or purchasing our
        products, you agree to these Terms of Service. Please read them
        carefully.
      </p>

      <LegalSection heading="1. Products & services">
        <p>
          {site.name} sells NFC (Near Field Communication) cards, tags,
          stickers, and stands that link to destinations you choose — such as
          Google review pages, social media profiles, WiFi networks, menus, and
          websites. You are responsible for the legality and accuracy of the
          destinations you ask us to program.
        </p>
      </LegalSection>

      <LegalSection heading="2. Orders & pricing">
        <p>
          All prices are listed in U.S. dollars. We reserve the right to correct
          pricing errors and to refuse or cancel any order. Custom orders begin
          production only after you approve the design proof we send you.
        </p>
      </LegalSection>

      <LegalSection heading="3. Custom design content">
        <p>
          If you upload artwork or ask us to design on your behalf, you confirm
          that you own or have the rights to all logos, images, and text
          provided. You grant us a limited license to use that content solely to
          produce your order. We may decline content that is unlawful,
          infringing, or offensive.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>
          You agree not to use our products to deceive consumers, violate the
          terms of any third-party platform (including Google, Meta, or others),
          or engage in any unlawful activity. Review-collection products must be
          used to invite honest, unincentivized feedback.
        </p>
      </LegalSection>

      <LegalSection heading="5. Intellectual property">
        <p>
          All site content, branding, and designs created by {site.name} remain
          our property unless otherwise agreed in writing. You retain ownership
          of your own brand assets.
        </p>
      </LegalSection>

      <LegalSection heading="6. Limitation of liability">
        <p>
          Products are provided “as is.” To the fullest extent permitted by law,
          {" "}
          {site.name} is not liable for indirect, incidental, or consequential
          damages arising from the use of our products or website.
        </p>
      </LegalSection>

      <LegalSection heading="7. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of the site
          after changes take effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Questions about these Terms? Email us at{" "}
          <a href={`mailto:${site.email}`} className="text-brand-300 underline">
            {site.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
