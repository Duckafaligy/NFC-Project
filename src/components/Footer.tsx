import Link from "next/link";
import { Facebook, Instagram, Nfc } from "lucide-react";
import { site } from "@/lib/site";
import { Newsletter } from "./Newsletter";
import { PaymentBadges } from "./PaymentBadges";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products/google-review-card", label: "Review cards" },
      { href: "/products/digital-business-card", label: "Business cards" },
      { href: "/products/all-in-one-card", label: "All-in-one" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#contact", label: "Contact" },
      { href: "/legal/shipping", label: "Shipping" },
      { href: "/legal/returns", label: "Returns" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/returns", label: "Refund Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </div>

      <div className="mt-16 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 font-display text-lg font-extrabold text-neutral-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-600">
                  <Nfc className="h-5 w-5 text-white" strokeWidth={2.5} />
                </span>
                {site.name}
              </Link>
              <p className="mt-4 max-w-xs text-sm text-neutral-500">
                {site.tagline}
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-neutral-900">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <PaymentBadges />
          </div>
        </div>
      </div>
    </footer>
  );
}
