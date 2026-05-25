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
          alignItems: "center",
          justifyContent: "center",
          background: "#34d399",
          color: "#04140d",
          fontSize: 44,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 14,
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}
