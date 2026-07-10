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
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

      <div className="legal-prose mt-10 space-y-6 text-slate-300">
        {children}
      </div>

      <div className="mt-12 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200/80">
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
      <h2 className="font-display text-xl font-semibold text-white">
        {heading}
      </h2>
      <div className="mt-2 space-y-3 leading-relaxed">{children}</div>
    </div>
  );
}
