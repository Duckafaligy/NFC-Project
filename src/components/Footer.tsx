import Link from "next/link";
import { Facebook, Instagram, Nfc } from "lucide-react";
import { site } from "@/lib/site";

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
      { href: "/how-it-works", label: "How it works" },
      { href: "/contact", label: "Contact" },
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
    <footer className="mt-24 border-t-2 border-ink bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg uppercase tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center border-2 border-white bg-yolk">
                <Nfc className="h-5 w-5 text-ink" strokeWidth={2.5} />
              </span>
              {site.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              {site.tagline}
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border-2 border-white/40 text-white/70 transition-colors hover:border-white hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border-2 border-white/40 text-white/70 transition-colors hover:border-white hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="tag text-yolk">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t-2 border-white/20 pt-6 font-mono text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>NFC products for businesses with counters.</p>
        </div>
      </div>
    </footer>
  );
}
