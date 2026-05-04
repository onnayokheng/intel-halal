"use client";

import { t, tObj } from "@/lib/i18n";

const PLANS = ["7day", "30day"] as const;

export default function Paywall({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        maxWidth: 430, margin: "0 auto",
        background: "rgba(27,27,25,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-fade-up" style={{
        background: "#F7F5F0",
        borderRadius: "24px 24px 0 0",
        padding: "28px 22px 52px",
        boxShadow: "0 -8px 40px rgba(27,27,25,0.18)",
      }}>
        {/* Pull handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "#D8D2C4", margin: "0 auto 24px" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="mono" style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1.6,
            textTransform: "uppercase", color: "#B85C3C", marginBottom: 10,
          }}>
            {t("paywall.badge")}
          </div>
          <h2 className="serif" style={{
            fontSize: 28, fontWeight: 400, letterSpacing: -0.5,
            margin: "0 0 10px", color: "#1B1B19", lineHeight: 1.1,
          }}>
            {t("paywall.title").split(" ").slice(0, -1).join(" ")}{" "}
            <em style={{ fontStyle: "italic", color: "#2C4A3E" }}>
              {t("paywall.title").split(" ").at(-1)}
            </em>
          </h2>
          <p style={{
            fontFamily: "var(--font-jakarta)", fontSize: 14,
            color: "#6B6A63", margin: 0, lineHeight: 1.5,
          }}>
            {t("paywall.subtitle")}
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {PLANS.map((plan) => {
            const info = tObj(`paywall.plans.${plan}`) as { label: string; price: string; desc: string };
            const is30 = plan === "30day";
            return (
              <div
                key={plan}
                style={{
                  background: is30 ? "#2C4A3E" : "#fff",
                  border: `0.5px solid ${is30 ? "transparent" : "#E8E3D6"}`,
                  borderRadius: 18,
                  padding: "16px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: is30
                    ? "0 8px 24px -8px rgba(44,74,62,0.45)"
                    : "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.12)",
                  position: "relative", overflow: "hidden",
                }}
              >
                {is30 && (
                  <div style={{
                    position: "absolute", top: 10, right: -18,
                    background: "#C8923A", color: "#fff",
                    fontFamily: "var(--font-mono)", fontSize: 8.5,
                    fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase",
                    padding: "3px 22px", transform: "rotate(35deg)",
                  }}>
                    Best
                  </div>
                )}
                <div>
                  <div style={{
                    fontFamily: "var(--font-jakarta)", fontSize: 15,
                    fontWeight: 700, color: is30 ? "#fff" : "#1B1B19",
                    marginBottom: 3,
                  }}>
                    {info.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-jakarta)", fontSize: 12.5,
                    color: is30 ? "rgba(255,255,255,0.7)" : "#6B6A63",
                  }}>
                    {info.desc}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{
                      fontSize: 16, fontWeight: 700,
                      color: is30 ? "#fff" : "#1B1B19", letterSpacing: -0.3,
                    }}>
                      {info.price}
                    </div>
                  </div>
                  <div style={{
                    background: is30 ? "rgba(255,255,255,0.15)" : "#EFEBE2",
                    color: is30 ? "#fff" : "#6B6A63",
                    borderRadius: 8, padding: "6px 10px",
                    fontFamily: "var(--font-jakarta)", fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {t("paywall.soon")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="tap"
          style={{
            width: "100%", height: 48,
            background: "transparent",
            border: "0.5px solid #D8D2C4",
            borderRadius: 14, cursor: "pointer",
            fontFamily: "var(--font-jakarta)", fontSize: 14,
            fontWeight: 600, color: "#6B6A63",
          }}
        >
          {t("paywall.later")}
        </button>
      </div>
    </div>
  );
}
