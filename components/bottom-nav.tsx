"use client";

import { t } from "@/lib/i18n";

export type Tab = "sholat" | "bea-impor" | "cek-halal" | "trip-plan" | "find-place";

interface NavItem {
  id: Tab;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  center?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "sholat",
    label: t("nav.sholat"),
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17.5 14.5A7 7 0 119.5 6.5a5.6 5.6 0 008 8z"
              stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M18 5.2l.7 1.6 1.6.3-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6L15.7 7.1l1.6-.3z"
              stroke={a ? "#fff" : "currentColor"} strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: "bea-impor",
    label: t("nav.beaImpor"),
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6"/>
        <path d="M3 10h18" stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6"/>
        <circle cx="8" cy="14.5" r="1.2" fill={a ? "#fff" : "currentColor"}/>
        <path d="M12 14h5" stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "cek-halal",
    label: t("nav.cekHalal"),
    center: true,
    icon: () => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2.5l8 3.5v6c0 4.7-3.4 8.6-8 9.5-4.6-.9-8-4.8-8-9.5v-6l8-3.5z"
              stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "trip-plan",
    label: t("nav.tripPlan"),
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 4h11a3 3 0 010 6H8a3 3 0 000 6h11"
              stroke={a ? "#fff" : "currentColor"} strokeWidth="1.7" strokeLinecap="round"/>
        <circle cx="5" cy="4" r="1.6" fill={a ? "#fff" : "currentColor"}/>
        <circle cx="19" cy="16" r="1.6" fill={a ? "#fff" : "currentColor"}/>
      </svg>
    ),
  },
  {
    id: "find-place",
    label: t("nav.findPlace"),
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"
              stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="2.4" stroke={a ? "#fff" : "currentColor"} strokeWidth="1.6"/>
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div style={{ padding: "0 12px 14px" }}>
        <div style={{
          background: "rgba(247,245,240,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: 24,
          padding: 6,
          display: "flex",
          gap: 2,
          alignItems: "center",
          position: "relative",
          overflow: "visible",
          boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 30px -12px rgba(35,25,5,0.22), 0 0 0 0.5px rgba(43,32,15,0.10)",
        }}>
          {TABS.map((item) => {
            const isActive = item.id === active;

            // Center FAB — Cek Halal
            if (item.center) {
              return (
                <div key={item.id} style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative" }}>
                  <button
                    onClick={() => onChange(item.id)}
                    className="tap"
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      border: "none",
                      width: 64, height: 64,
                      marginTop: -22,
                      background: isActive ? "#93462C" : "#B85C3C",
                      color: "#fff",
                      borderRadius: 22,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 2,
                      fontFamily: "var(--font-jakarta)",
                      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3,
                      cursor: "pointer",
                      boxShadow: "0 14px 28px -10px rgba(184,92,60,0.65), 0 0 0 4px #F7F5F0, 0 0 0 4.5px rgba(184,92,60,0.20)",
                    }}
                  >
                    {item.icon(isActive)}
                    <span style={{ marginTop: 1 }}>{item.label}</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className="tap"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  flex: 1,
                  border: "none",
                  background: isActive ? "#2C4A3E" : "transparent",
                  color: isActive ? "#fff" : "#3D3D3A",
                  borderRadius: 18,
                  padding: "9px 2px 8px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                  fontFamily: "var(--font-jakarta)",
                  fontSize: 10, fontWeight: 600, letterSpacing: 0.1,
                  cursor: "pointer",
                  boxShadow: isActive ? "0 6px 14px -6px rgba(44,74,62,0.55)" : "none",
                  transition: "background 200ms ease, color 200ms ease",
                  minHeight: 44,
                }}
              >
                {item.icon(isActive)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
