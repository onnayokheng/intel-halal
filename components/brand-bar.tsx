"use client";

import { t, useLocale, type Locale } from "@/lib/i18n";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { trialMsRemaining } from "@/lib/access";

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
        style={{ fontSize: height, fontWeight: 600, letterSpacing: -0.4, color: "#1B1B19", lineHeight: 1 }}
      >
        Intel<span style={{ color: "#2C4A3E" }}>·</span>Halal
      </span>
    </div>
  );
}

const LOCALE_LABELS: Record<Locale, string> = { id: "ID", en: "EN" };

function formatRemaining(ms: number): string {
  if (ms <= 0) return t("trial.expired");
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}j ${m}m ${t("trial.remaining")}`;
  if (m > 0) return `${m}m ${t("trial.remaining")}`;
  return `<1m ${t("trial.remaining")}`;
}

function TrialPill({ onUpgrade }: { onUpgrade: () => void }) {
  const { data: session } = useSession();
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    const trialAt = (session.user as { trialExpiresAt?: string | Date }).trialExpiresAt;
    if (!trialAt) return;

    const tick = () => setMsLeft(trialMsRemaining(trialAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  if (msLeft === null) return null;

  const expired = msLeft <= 0;

  return (
    <button
      onClick={onUpgrade}
      className="tap"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: expired ? "#B85C3C" : "#DFE8DA",
        color: expired ? "#fff" : "#2C4A3E",
        border: "none", borderRadius: 999,
        padding: "5px 10px 5px 8px",
        cursor: "pointer",
        boxShadow: expired ? "0 4px 10px -4px rgba(184,92,60,0.5)" : "none",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          fill={expired ? "#fff" : "#2C4A3E"} />
      </svg>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
        letterSpacing: 0.4, whiteSpace: "nowrap",
      }}>
        {expired ? t("trial.upgrade") : formatRemaining(msLeft)}
      </span>
    </button>
  );
}

/** Fixed top brand bar with language toggle + trial countdown */
export default function BrandBar({ onUpgrade }: { onUpgrade?: () => void }) {
  const [locale, setLocale] = useLocale();
  const { data: session } = useSession();
  const next: Locale = locale === "id" ? "en" : "id";

  const hasUser = !!session?.user;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, zIndex: 30,
        padding: "18px 20px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to bottom, #F7F5F0 0%, #F7F5F0 75%, rgba(247,245,240,0) 100%)",
      }}
    >
      <BrandLogo height={18} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Trial pill — only if logged in */}
        {hasUser && onUpgrade && (
          <TrialPill onUpgrade={onUpgrade} />
        )}

        {/* Language toggle pill */}
        <button
          onClick={() => setLocale(next)}
          className="tap"
          aria-label={`Switch to ${next.toUpperCase()}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 0,
            background: "#EFEBE2", border: "0.5px solid #D8D2C4",
            borderRadius: 999, padding: 2,
            cursor: "pointer",
            boxShadow: "0 1px 0 rgba(43,32,15,.04)",
          }}
        >
          {(["id", "en"] as Locale[]).map((l) => (
            <span
              key={l}
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 9.5, fontWeight: 600, letterSpacing: 1.2,
                padding: "4px 8px", borderRadius: 999,
                background: locale === l ? "#2C4A3E" : "transparent",
                color: locale === l ? "#fff" : "#9B998F",
                textTransform: "uppercase",
                transition: "background 180ms ease, color 180ms ease",
              }}
            >
              {LOCALE_LABELS[l]}
            </span>
          ))}
        </button>
      </div>
    </div>
  );
}
