/**
 * Consistent numbered section organizer. Keeps every home-page section
 * scannable: numbered chip + eyebrow, then the title and optional subline.
 */
export function SectionHeader({
  n,
  eyebrow,
  title,
  sub,
  dark = false,
  align = "center",
}: {
  n: string;
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
          centered ? "justify-center" : ""
        } ${dark ? "text-neutral-500" : "text-neutral-400"}`}
      >
        <span
          className={`rounded-sm px-1.5 py-0.5 font-display text-[11px] ${
            dark ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"
          }`}
        >
          {n}
        </span>
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-3xl font-extrabold sm:text-4xl ${
          dark ? "text-white" : "text-neutral-900"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-3 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
