import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          padding: "14px 12px",
          background: "#34d399",
          borderRadius: 14,
        }}
      >
        <div style={{ display: "flex", height: 8, background: "#04140d", borderRadius: 4, width: "100%" }} />
        <div
          style={{
            display: "flex",
            height: 8,
            background: "#04140d",
            opacity: 0.55,
            borderRadius: 4,
            width: "78%",
          }}
        />
        <div
          style={{
            display: "flex",
            height: 8,
            background: "#04140d",
            opacity: 0.3,
            borderRadius: 4,
            width: "55%",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
