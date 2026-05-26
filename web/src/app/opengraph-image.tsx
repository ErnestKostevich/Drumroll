import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Drumroll — Beautiful waitlists for AI startups";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,211,153,0.25), transparent 70%), #07090c",
          color: "#f4f6fb",
          fontFamily: "Geist, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#c0c7d4",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#34d399",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "10px 8px",
              justifyContent: "center",
            }}
          >
            <div style={{ height: 6, background: "#04140d", borderRadius: 3, width: "100%" }} />
            <div style={{ height: 6, background: "#04140d", opacity: 0.55, borderRadius: 3, width: "78%" }} />
            <div style={{ height: 6, background: "#04140d", opacity: 0.3, borderRadius: 3, width: "55%" }} />
          </div>
          <div style={{ display: "flex" }}>
            Drum<span style={{ color: "#34d399", marginLeft: 2 }}>roll</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 600,
              letterSpacing: "-0.045em",
              lineHeight: 1,
            }}
          >
            Beautiful waitlists
          </div>
          <div
            style={{
              fontSize: 112,
              fontWeight: 600,
              letterSpacing: "-0.045em",
              lineHeight: 1,
              background:
                "linear-gradient(135deg, #f4f6fb 0%, #34d399 50%, #a78bfa 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            for AI startups.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#8a93a6" }}>
            AI copy · viral referrals · real analytics
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 28px",
              borderRadius: 999,
              background: "#34d399",
              color: "#04140d",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Launch in 60 seconds →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
