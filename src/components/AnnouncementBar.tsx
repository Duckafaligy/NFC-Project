import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { preorderActive, discountRate } from "@/lib/pricing";

export function AnnouncementBar() {
  return (
    <div className="bg-neutral-900">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium text-neutral-200 sm:text-[13px]">
        {preorderActive() && (
          <span className="mr-1 rounded-sm bg-violet-600 px-1.5 py-0.5 font-bold">
            Pre-order open: {Math.round(discountRate() * 100)}% off everything
          </span>
        )}{" "}
        Free shipping over {formatPrice(site.shipping.freeThreshold)} ·{" "}
        {site.guaranteeDays}-day money-back guarantee · No subscriptions
      </p>
    </div>
  );
}
