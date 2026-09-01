import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Link preview card, generated at build time. Anything sharing the homepage —
 * a message, a social post, a search result — renders this instead of a bare
 * URL. Drawn rather than photographed so it needs no asset pipeline and stays
 * legible at thumbnail size.
 */
export const runtime = "nodejs";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#C1592E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            ((
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#111111" }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 940,
            }}
          >
            One tap. More reviews.
          </div>
          <div style={{ fontSize: 32, color: "#525252", maxWidth: 900 }}>
            NFC review cards for local business. They tap, your Google review
            page opens. No app, no QR code.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {["Google Reviews", "Instagram"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "2px solid #e5e5e5",
                borderRadius: 10,
                padding: "12px 22px",
                fontSize: 26,
                color: "#404040",
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
