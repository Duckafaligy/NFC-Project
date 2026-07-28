/**
 * Tag presets — pure data, safe to import in client components. Each preset is
 * just a category label + helper copy; every preset ultimately redirects the
 * tap to the URL the owner sets. (The server logic lives in lib/tags.)
 */
export const TAG_PRESETS = [
  {
    id: "review",
    label: "Google review",
    help: "Paste your Google review link — a tap opens your review page.",
    placeholder: "https://g.page/r/…/review",
  },
  {
    id: "instagram",
    label: "Instagram",
    help: "Your Instagram profile URL.",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    id: "menu",
    label: "Menu",
    help: "A link to your digital menu.",
    placeholder: "https://…",
  },
  {
    id: "website",
    label: "Website",
    help: "Any page — homepage, booking, or store.",
    placeholder: "https://…",
  },
  {
    id: "link",
    label: "Anything",
    help: "Any link you want the tap to open.",
    placeholder: "https://…",
  },
] as const;

export type TagPresetId = (typeof TAG_PRESETS)[number]["id"];

export function isValidPreset(id: string): boolean {
  return TAG_PRESETS.some((p) => p.id === id);
}
