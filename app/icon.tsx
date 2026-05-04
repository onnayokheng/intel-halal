import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          background: "#2C4A3E",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 16,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          letterSpacing: -0.5,
        }}
      >
        ih
      </div>
    ),
    { ...size }
  );
}
