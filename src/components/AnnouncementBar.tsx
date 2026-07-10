import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export function AnnouncementBar() {
  return (
    <div className="bg-slate-900">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide text-slate-200 sm:text-[13px]">
        Free shipping over {formatPrice(site.shipping.freeThreshold)} ·{" "}
        {site.guaranteeDays}-day money-back guarantee · No subscriptions, ever
      </p>
    </div>
  );
}
