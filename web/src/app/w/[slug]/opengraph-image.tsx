import { ImageResponse } from "next/og";
import { ensureDemoSeed, getWaitlist } from "@/lib/store";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Join the waitlist";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  await ensureDemoSeed();
  const wl = await getWaitlist(params.slug);

  const productName = wl?.productName ?? "Untitled";
  const tagline = wl?.tagline ?? "Launching soon.";
  const emoji = wl?.accentEmoji ?? "✦";

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
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,211,153,0.22), transparent 70%), #07090c",
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
              background: "#34d399",
              color: "#04140d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            W
          </div>
          <div style={{ display: "flex" }}>
            Waitlist<span style={{ color: "#34d399", marginLeft: 2 }}>Kit</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 56,
              color: "#34d399",
              lineHeight: 1,
            }}
          >
            {emoji}
          </div>
          <div
            style={{
              fontSize: 96,
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
              fontSize: 36,
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
              background: "#34d399",
              color: "#04140d",
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
    {
      ...size,
    },
  );
}
