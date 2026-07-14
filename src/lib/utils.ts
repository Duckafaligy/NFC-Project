import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { site } from "./site";

/** Merge Tailwind class names safely (conditional + de-duplicated). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number in the store currency (see site.currency), e.g. "CA$34.99". */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat(site.currency.locale, {
    style: "currency",
    currency: site.currency.code,
  }).format(amount);
}
