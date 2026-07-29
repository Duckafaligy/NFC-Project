"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Nfc, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** One nav item everywhere: the store. */
const links = [{ href: "/products", label: "Products" }];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the homepage the header rides transparent over the hero and
  // solidifies into a light bar once you scroll past it.
  const homePage = pathname === "/";

  useEffect(() => {
    if (!homePage) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [homePage]);


  return (
    <header
      className={cn(
        "top-0 z-50 transition-colors duration-300",
        homePage
          ? "fixed inset-x-0"
          : "sticky border-b border-neutral-200 bg-cream/90 backdrop-blur-xl",
        homePage &&
          (scrolled
            ? "border-b border-neutral-200 bg-white/90 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"),
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-display text-lg font-extrabold text-neutral-900",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md bg-[#2E7DFF]",
            )}
          >
            <Nfc className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          {site.name}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = !homePage && pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white text-neutral-900 shadow-soft"
                    : "text-neutral-600 hover:text-neutral-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* High-contrast primary CTA (homepage only). */}
          {homePage && (
            <Link
              href="/products"
              className="hidden rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-700 sm:block"
            >
              Check it out
            </Link>
          )}
          <button
            onClick={openDrawer}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-soft transition-all hover:shadow-lift",
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
              "flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 md:hidden",
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
            "border-t border-neutral-200 bg-white px-4 py-3 md:hidden",
          )}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50",
              )}
            >
              {l.label}
            </Link>
          ))}
          {homePage && (
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-bold text-white"
            >
              Check it out
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
