"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Nfc } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Newsletter } from "./Newsletter";
import { PaymentBadges } from "./PaymentBadges";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products/google-review-card", label: "Google review card" },
      { href: "/products/instagram-card", label: "Instagram card" },
      { href: "/products/acrylic-review-stand", label: "Acrylic review stand" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/products", label: "Products" },
      { href: "/legal/shipping", label: "Shipping" },
      { href: "/legal/returns", label: "Maintenance" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/returns", label: "Maintenance Policy" },
    ],
  },
];

export function Footer() {
  // The homepage is a dark landing page — the footer follows it so the page
  // doesn't end in a jarring white slab. Every other page keeps the light UI.
  const dark = usePathname() === "/";

  return (
    <footer className={cn(dark ? "bg-neutral-950" : "mt-24")}>
      {/* The newsletter block belongs to the light store experience. */}
      {!dark && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Newsletter />
        </div>
      )}

      <div
        className={cn(
          "border-t",
          dark ? "border-white/10 bg-neutral-950" : "mt-16 border-neutral-200 bg-white",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-2 font-display text-lg font-extrabold",
                  dark ? "text-white" : "text-neutral-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    dark ? "bg-[#2E7DFF]" : "bg-orange-600",
                  )}
                >
                  <Nfc className="h-5 w-5 text-white" strokeWidth={2.5} />
                </span>
                {site.name}
              </Link>
              <p
                className={cn(
                  "mt-4 max-w-xs text-sm",
                  dark ? "text-neutral-400" : "text-neutral-500",
                )}
              >
                {site.tagline}
              </p>
              <div className="mt-5 flex gap-3">
                {[
                  { href: site.social.instagram, Icon: Instagram, label: "Instagram" },
                  { href: site.social.facebook, Icon: Facebook, label: "Facebook" },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                      dark
                        ? "border-white/15 text-neutral-400 hover:border-white/30 hover:text-white"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900",
                    )}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4
                  className={cn(
                    "text-sm font-bold",
                    dark ? "text-white" : "text-neutral-900",
                  )}
                >
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "text-sm transition-colors",
                          dark
                            ? "text-neutral-400 hover:text-white"
                            : "text-neutral-500 hover:text-neutral-900",
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row",
              dark ? "border-white/10" : "border-neutral-200",
            )}
          >
            <p
              className={cn(
                "text-sm",
                dark ? "text-neutral-500" : "text-neutral-400",
              )}
            >
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <PaymentBadges />
          </div>
        </div>
      </div>
    </footer>
  );
}
