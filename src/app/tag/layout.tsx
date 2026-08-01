import type { Metadata } from "next";

/**
 * Tag claim/manage pages are per-customer and reached by an unguessable code.
 * robots.ts already disallows them; this adds the header-level noindex too,
 * so a page that gets linked from somewhere still stays out of results.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
