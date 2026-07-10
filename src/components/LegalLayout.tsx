import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl uppercase leading-tight text-ink">
        {title}
      </h1>
      <p className="tag mt-3 text-ink/50">Last updated: {updated}</p>

      <div className="mt-10 space-y-6 text-ink/80">{children}</div>

      <div className="box mt-12 bg-yolk p-4 text-sm font-medium text-ink">
        This page is a general template and not legal advice. Have a qualified
        attorney review your policies before you rely on them.
      </div>
    </section>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-xl uppercase text-ink">{heading}</h2>
      <div className="mt-2 space-y-3 leading-relaxed">{children}</div>
    </div>
  );
}
