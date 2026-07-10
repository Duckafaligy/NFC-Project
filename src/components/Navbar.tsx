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
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg uppercase tracking-tight text-ink"
        >
          <span className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-yolk shadow-brutal-sm">
            <Nfc className="h-5 w-5 text-ink" strokeWidth={2.5} />
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
                  "border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                  active
                    ? "border-ink bg-white shadow-brutal-sm"
                    : "border-transparent text-ink/70 hover:border-ink hover:bg-white hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/checkout"
            className="relative flex h-10 w-10 items-center justify-center border-2 border-ink bg-white shadow-brutal-sm transition-all hover:-translate-y-0.5 hover:shadow-brutal"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5 text-ink" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-ink bg-bubble px-0.5 font-mono text-[11px] font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white shadow-brutal-sm md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t-2 border-ink bg-cream px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-2 border-transparent px-4 py-3 text-sm font-bold text-ink hover:border-ink hover:bg-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
