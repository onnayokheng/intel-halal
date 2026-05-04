import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180, height: 180,
          background: "#2C4A3E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 88,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          letterSpacing: -3,
        }}
      >
        ih
      </div>
    ),
    { ...size }
  );
}
