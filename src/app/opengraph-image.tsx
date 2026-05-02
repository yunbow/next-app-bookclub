import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "next-app-bookclub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 24 }}>
          next-app-bookclub
        </div>
      </div>
    ),
    { ...size },
  );
}
