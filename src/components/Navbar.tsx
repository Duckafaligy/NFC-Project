"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Nfc, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-cream/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold text-stone-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-soft">
            <Nfc className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          {site.name}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white text-stone-900 shadow-soft"
                    : "text-stone-500 hover:bg-white hover:text-stone-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-soft transition-all hover:shadow-lift"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-stone-200 bg-cream px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
