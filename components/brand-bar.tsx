"use client";

import { t } from "@/lib/i18n";

/** Eight-point star with halal checkmark — the Intel Halal brand mark */
export function BrandMark({ size = 28, color = "#2C4A3E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <path
        d="M20 2 L24.5 14 L37 18 L24.5 22 L20 36 L15.5 22 L3 18 L15.5 14 Z"
        fill={color} stroke={color} strokeWidth="1.2" strokeLinejoin="round"
      />
      <path
        d="M14.5 19.5 L18.5 23 L25.5 15.5"
        fill="none" stroke="#F7F5F0" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full wordmark: star + "Intel·Halal" in Fraunces */
export function BrandLogo({ height = 22 }: { height?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <BrandMark size={height + 6} color="#2C4A3E" />
      <span
        className="serif"
        style={{
          fontSize: height,
          fontWeight: 600,
          letterSpacing: -0.4,
          color: "#1B1B19",
          lineHeight: 1,
        }}
      >
        {t("brand.name").split("·")[0]}<span style={{ color: "#2C4A3E" }}>·</span>{t("brand.name").split("·")[1]}
      </span>
    </div>
  );
}

/** Fixed top brand bar — shared across all screens */
export default function BrandBar() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        zIndex: 30,
        padding: "18px 20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(to bottom, #F7F5F0 0%, #F7F5F0 75%, rgba(247,245,240,0) 100%)",
      }}
    >
      <BrandLogo height={18} />
      <span
        className="mono"
        style={{
          fontSize: 9.5,
          fontWeight: 500,
          letterSpacing: 1.4,
          color: "#9B998F",
          textTransform: "uppercase",
        }}
      >
        {t("brand.locale")}
      </span>
    </div>
  );
}
