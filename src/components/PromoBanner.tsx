import Link from "next/link";
import {
  BadgePercent,
  Infinity as InfinityIcon,
  ShieldCheck,
  Timer,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { preorderActive, discountRate } from "@/lib/pricing";

interface Item {
  href: string;
  icon: LucideIcon;
  color: string;
  label: string;
}

/**
 * The one promo band, below the hero. A continuous ticker: the offers glide
 * sideways in an endless loop, each with a semantic icon and generous
 * spacing between items, pausing while hovered. Replaces both the old
 * topbar above the navbar and the old color-dot ticker.
 *
 * The row is rendered twice back to back; the marquee animation translates
 * the track by exactly -50%, so the loop is seamless.
 */
export function PromoBanner() {
  const items: Item[] = [
    ...(preorderActive()
      ? [
          {
            href: "/products",
            icon: BadgePercent,
            color: "text-violet-400",
            label: `Pre-order open: ${Math.round(discountRate() * 100)}% off everything, no code needed`,
          },
        ]
      : []),
    {
      href: "/products/google-review-card",
      icon: TrendingUp,
      color: "text-emerald-400",
      label: "312 reviews in 6 months at 2 yeses a day",
    },
    {
      href: "/products",
      icon: Truck,
      color: "text-blue-400",
      label: `Free shipping on orders over ${formatPrice(site.shipping.freeThreshold)}`,
    },
    {
      href: "/#how-it-works",
      icon: Timer,
      color: "text-amber-400",
      label: "Tap to review in about 20 seconds",
    },
    {
      href: "/legal/returns",
      icon: ShieldCheck,
      color: "text-emerald-400",
      label: `${site.guaranteeDays}-day money-back guarantee`,
    },
    {
      href: "/products",
      icon: InfinityIcon,
      color: "text-violet-400",
      label: "No subscriptions. Buy the card once, own it forever",
    },
  ];

  return (
    <div className="group relative overflow-hidden border-y border-white/5 bg-neutral-950">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center gap-28 py-4 pr-28"
          >
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                tabIndex={copy === 1 ? -1 : undefined}
                className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
              >
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 ${item.color}`}
                  aria-hidden
                />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      {/* Edge fades so items dissolve in and out instead of hard-clipping */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-950 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-950 to-transparent"
      />
    </div>
  );
}
