import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export function AnnouncementBar() {
  return (
    <div className="border-b-2 border-ink bg-ink">
      <p className="tag mx-auto max-w-7xl px-4 py-2 text-center text-white">
        Free shipping over {formatPrice(site.shipping.freeThreshold)} ·{" "}
        {site.guaranteeDays}-day returns · No subscriptions
      </p>
    </div>
  );
}
