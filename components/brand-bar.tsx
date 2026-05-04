"use client";

import { t, useLocale, type Locale } from "@/lib/i18n";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";

function trialMsRemaining(trialExpiresAt: Date | string | null | undefined): number {
  if (!trialExpiresAt) return -1;
  return new Date(trialExpiresAt).getTime() - Date.now();
}

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
  const devSkip = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";

  useEffect(() => {
    const mockAt = devSkip ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null;
    const trialAt = mockAt
      ?? (session?.user as { trialExpiresAt?: string | Date } | undefined)?.trialExpiresAt;
    if (!trialAt) return;

    const tick = () => setMsLeft(trialMsRemaining(trialAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session, devSkip]);

  if (msLeft === null) return null;
  const expired = msLeft <= 0;

  return (
    <button onClick={onUpgrade} className="tap" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: expired ? "#B85C3C" : "#FDE68A",
      color: expired ? "#fff" : "#78350F",
      border: "none", borderRadius: 999,
      padding: "5px 10px 5px 8px", cursor: "pointer",
      boxShadow: expired ? "0 4px 10px -4px rgba(184,92,60,0.5)" : "none",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          fill={expired ? "#fff" : "#78350F"} />
      </svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: 0.4, whiteSpace: "nowrap" }}>
        {expired ? t("trial.upgrade") : formatRemaining(msLeft)}
      </span>
    </button>
  );
}

function UserSheet({ name, email, image, onClose }: {
  name: string; email: string; image?: string | null; onClose: () => void;
}) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true") {
      // Dev mode: just close the sheet
      onClose(); return;
    }
    await signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        maxWidth: 430, margin: "0 auto",
        background: "rgba(27,27,25,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div
        className="animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F7F5F0", borderRadius: "22px 22px 0 0",
          padding: "20px 22px 48px",
          boxShadow: "0 -8px 40px rgba(27,27,25,0.15)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "#D8D2C4", margin: "0 auto 20px" }} />

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#2C4A3E", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#1B1B19", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6B6A63", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "0.5px", background: "#E8E3D6", marginBottom: 16 }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="tap"
          style={{
            width: "100%", height: 52, border: "none",
            background: "#F1D5C7", color: "#6B2F1D",
            borderRadius: 14, cursor: "pointer",
            fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      border: "1.5px solid #E8E3D6",
      background: "#2C4A3E",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {image
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 10, fontWeight: 700, color: "#fff" }}>{initials}</span>
      }
    </div>
  );
}

/** Fixed top brand bar with language toggle + trial countdown + user avatar */
export default function BrandBar({ onUpgrade }: { onUpgrade?: () => void }) {
  const [locale, setLocale] = useLocale();
  const { data: session } = useSession();
  const [showUserSheet, setShowUserSheet] = useState(false);
  const next: Locale = locale === "id" ? "en" : "id";

  const devSkip = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";
  const hasUser = devSkip || !!session?.user;
  const user = devSkip
    ? { name: "Dev User", email: "dev@intelhalal.app", image: null }
    : session?.user ?? null;

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, zIndex: 30,
        padding: "18px 20px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to bottom, #F7F5F0 0%, #F7F5F0 75%, rgba(247,245,240,0) 100%)",
      }}>
        <BrandLogo height={18} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasUser && onUpgrade && <TrialPill onUpgrade={onUpgrade} />}

          {/* Language toggle */}
          <button onClick={() => setLocale(next)} className="tap" aria-label={`Switch to ${next.toUpperCase()}`} style={{
            display: "inline-flex", alignItems: "center", gap: 0,
            background: "#EFEBE2", border: "0.5px solid #D8D2C4",
            borderRadius: 999, padding: 2, cursor: "pointer",
            boxShadow: "0 1px 0 rgba(43,32,15,.04)",
          }}>
            {(["id", "en"] as Locale[]).map((l) => (
              <span key={l} style={{
                fontFamily: "var(--font-jetbrains)", fontSize: 9.5, fontWeight: 600,
                letterSpacing: 1.2, padding: "4px 8px", borderRadius: 999,
                background: locale === l ? "#2C4A3E" : "transparent",
                color: locale === l ? "#fff" : "#9B998F",
                textTransform: "uppercase",
                transition: "background 180ms ease, color 180ms ease",
              }}>
                {LOCALE_LABELS[l]}
              </span>
            ))}
          </button>

          {/* User avatar — only if real session (not dev mock) */}
          {user && (
            <button onClick={() => setShowUserSheet(true)} className="tap" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <UserAvatar name={user.name} image={user.image} />
            </button>
          )}
        </div>
      </div>

      {showUserSheet && user && (
        <UserSheet
          name={user.name}
          email={user.email}
          image={user.image}
          onClose={() => setShowUserSheet(false)}
        />
      )}
    </>
  );
}
