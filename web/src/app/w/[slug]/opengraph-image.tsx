import { ImageResponse } from "next/og";
import { ensureDemoSeed, getWaitlist } from "@/lib/store";
import { ACCENT_PALETTE } from "@/lib/db/schema";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Join the waitlist";

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureDemoSeed();
  const wl = await getWaitlist(slug);

  const productName = wl?.productName ?? "Untitled";
  const tagline = wl?.tagline ?? "Launching soon.";
  const palette = ACCENT_PALETTE[wl?.accentColor ?? "emerald"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${hexToRgba(palette.brand, 0.22)}, transparent 70%), #07090c`,
          color: "#f4f6fb",
          fontFamily: "Geist, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#c0c7d4",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: palette.brand,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              padding: "9px 7px",
              justifyContent: "center",
            }}
          >
            <div style={{ height: 5, background: palette.ink, borderRadius: 2.5, width: "100%" }} />
            <div style={{ height: 5, background: palette.ink, opacity: 0.55, borderRadius: 2.5, width: "78%" }} />
            <div style={{ height: 5, background: palette.ink, opacity: 0.3, borderRadius: 2.5, width: "55%" }} />
          </div>
          <div style={{ display: "flex" }}>
            Waitlist
            <span style={{ color: palette.brand, marginLeft: 2 }}>Kit</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              fontFamily: "monospace",
              color: palette.brand,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 28, height: 2, background: palette.brand }} />
            Now in beta
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              maxWidth: 1040,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#c0c7d4",
              lineHeight: 1.3,
              maxWidth: 980,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 24px",
              borderRadius: 999,
              background: palette.brand,
              color: palette.ink,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Join the waitlist →
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#8a93a6" }}>
            Powered by WaitlistKit
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
