"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Nfc, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

/** Homepage-only nav links (the dark landing page sections). */
const homeLinks = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#designs", label: "Designs" },
  { href: "/#pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The homepage is a dark landing page: the header rides transparent over
  // the hero and solidifies into a dark bar once you scroll past it.
  const darkPage = pathname === "/";

  useEffect(() => {
    if (!darkPage) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [darkPage]);

  // Transparent over the hero -> solid dark; other pages keep the light bar.
  const solid = !darkPage || scrolled;
  const navLinks = darkPage ? homeLinks : links;

  return (
    <header
      className={cn(
        "top-0 z-50 transition-colors duration-300",
        darkPage ? "fixed inset-x-0" : "sticky border-b border-neutral-200 bg-cream/90 backdrop-blur-xl",
        darkPage &&
          (scrolled
            ? "border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"),
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-display text-lg font-extrabold",
            darkPage ? "text-white" : "text-neutral-900",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md",
              darkPage ? "bg-[#2E7DFF]" : "bg-orange-600",
            )}
          >
            <Nfc className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          {site.name}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = !darkPage && pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  darkPage
                    ? "text-neutral-300 hover:text-white"
                    : active
                      ? "bg-white text-neutral-900 shadow-soft"
                      : "text-neutral-500 hover:bg-white hover:text-neutral-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* High-contrast primary CTA (homepage only). */}
          {darkPage && (
            <Link
              href="/products"
              className="hidden rounded-md bg-white px-4 py-2.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-200 sm:block"
            >
              Design Yours
            </Link>
          )}
          <button
            onClick={openDrawer}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-md border transition-all",
              darkPage
                ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                : "border-neutral-200 bg-white text-neutral-700 shadow-soft hover:shadow-lift",
            )}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-[#2E7DFF] px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
          <button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border md:hidden",
              darkPage
                ? "border-white/15 bg-white/5 text-white"
                : "border-neutral-200 bg-white text-neutral-700",
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          className={cn(
            "px-4 py-3 md:hidden",
            darkPage
              ? "border-t border-white/10 bg-neutral-950/95 backdrop-blur-xl"
              : "border-t border-neutral-200 bg-cream",
          )}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-4 py-3 text-sm font-semibold",
                darkPage
                  ? "text-neutral-200 hover:bg-white/5"
                  : "text-neutral-700 hover:bg-white",
              )}
            >
              {l.label}
            </Link>
          ))}
          {darkPage && (
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-md bg-white px-4 py-3 text-center text-sm font-bold text-neutral-950"
            >
              Design Yours
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
