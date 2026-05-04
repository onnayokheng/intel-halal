"use client";

import { t, ta } from "@/lib/i18n";

import { useState } from "react";

const CAT_ICONS: Record<string, string> = {
  akomodasi: "🏨", kuliner: "🍱", transport: "🚆", belanja: "🛒",
  wisata: "⛩️",  lifestyle: "🧖", layanan: "🏥",  ibadah: "🕌",
};

const CAT_ORDER = ["akomodasi","kuliner","transport","belanja","wisata","lifestyle","layanan","ibadah"];

type LocationState = "no-location" | "locating" | "located";

export default function FindPlace() {
  const [locState, setLocState]         = useState<LocationState>("no-location");
  const [locationName, setLocationName] = useState("");
  const [locError, setLocError]         = useState("");
  const [categoryId, setCategoryId]     = useState<string | null>(null);
  const [subCategory, setSubCategory]   = useState<string | null>(null);

  // Build category list per render so labels re-translate on locale switch
  const CATEGORIES = CAT_ORDER.map((id) => ({
    id,
    icon: CAT_ICONS[id],
    label: t(`findPlace.categoryLabels.${id}`),
    subs:  ta(`findPlace.subs.${id}`),
  }));

  const fetchFromIP = async () => {
    try {
      const res  = await fetch("https://ipwho.is/");
      const data = await res.json();
      if (data?.success) { setLocationName(`${data.city}, ${data.region}`); setLocState("located"); return; }
      const res2  = await fetch("https://freeipapi.com/api/json");
      const data2 = await res2.json();
      if (data2?.cityName) { setLocationName(`${data2.cityName}, ${data2.regionName}`); setLocState("located"); return; }
      throw new Error("Gagal");
    } catch {
      setLocError(t("findPlace.location.errorGps"));
      setLocState("no-location");
    }
  };

  const detect = () => {
    setLocState("locating"); setLocError("");
    if (!navigator.geolocation) { fetchFromIP(); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "id" } }
          );
          const data = await res.json();
          const city    = data?.address?.city || data?.address?.town || data?.address?.county || "";
          const country = data?.address?.country || "";
          setLocationName(`${city}${city && country ? ", " : ""}${country}` || data?.display_name?.split(",").slice(0, 2).join(", ") || "Lokasi terdeteksi");
          setLocState("located");
        } catch { fetchFromIP(); }
      },
      () => fetchFromIP(),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const search = () => {
    if (!subCategory) return;
    const loc   = locationName || "me";
    const query = encodeURIComponent(`${subCategory} near ${loc} within 2 miles`);
    window.open(`https://www.google.com/maps/search/${query}`, "_blank");
  };

  const activeCat = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 96, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "72px 22px 18px" }}>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6, margin: "0 0 8px", lineHeight: 1.05 }}>{t("findPlace.title")}</h1>
        <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
          {t("findPlace.subtitle")}
        </p>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Location card */}
        <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: 18, boxShadow: "var(--shadow-card)" }}>
          {locState === "locating" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
              <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#2C4A3E", opacity: 0.15 }} className="animate-locating" />
                <div style={{
                  position: "absolute", inset: 8, borderRadius: "50%",
                  background: "#2C4A3E", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" fill="#fff"/>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t("findPlace.location.detecting")}</div>
                <div style={{ fontSize: 12, color: "#6B6A63", marginTop: 2 }}>{t("findPlace.location.detectingDesc")}</div>
              </div>
            </div>
          ) : locState === "located" ? (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "#DFE8DA",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" fill="#2C4A3E" fillOpacity="0.9"/>
                    <circle cx="12" cy="10" r="2.5" fill="#F7F5F0"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 1.2, color: "#2C4A3E", textTransform: "uppercase", marginBottom: 2 }}>
                    {t("findPlace.location.detected")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1B1B19" }}>{locationName}</div>
                </div>
                <button onClick={detect} className="tap" style={{
                  border: "none", background: "#EFEBE2", color: "#6B6A63",
                  borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {t("findPlace.location.update")}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#EFEBE2",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" stroke="#2C4A3E" strokeWidth="2"/>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2C4A3E" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1B1B19" }}>{t("findPlace.location.detectTitle")}</div>
                  <div style={{ fontSize: 12, color: "#6B6A63", marginTop: 2 }}>{t("findPlace.location.detectDesc")}</div>
                </div>
              </div>
              {locError && (
                <div style={{ padding: "10px 12px", background: "#F1D5C7", borderRadius: 10, fontSize: 12, color: "#6B2F1D" }}>
                  {locError}
                </div>
              )}
              <button onClick={detect} className="tap" style={{
                height: 48, width: "100%",
                background: "#2C4A3E", color: "#fff",
                border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 6px 14px -6px rgba(44,74,62,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="#fff"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t("findPlace.location.detect")}
              </button>
            </div>
          )}
        </div>

        {/* Category grid — 2 columns */}
        <div>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
            {t("findPlace.search.categoryTitle")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(isActive ? null : cat.id); setSubCategory(null); }}
                  className="tap"
                  style={{
                    background: isActive ? "#2C4A3E" : "#fff",
                    color: isActive ? "#fff" : "#1B1B19",
                    border: `0.5px solid ${isActive ? "transparent" : "#E8E3D6"}`,
                    borderRadius: 14, padding: "14px 14px",
                    textAlign: "left", cursor: "pointer",
                    boxShadow: isActive ? "0 8px 18px -8px rgba(44,74,62,0.55)" : "var(--shadow-soft)",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{cat.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-category pills */}
        {activeCat && (
          <div className="animate-fade-up">
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 10 }}>
              Pilih Spesifik
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {activeCat.subs.map((sub) => {
                const isActive = subCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(isActive ? null : sub)}
                    className="tap"
                    style={{
                      background: isActive ? "#2C4A3E" : "#fff",
                      color: isActive ? "#fff" : "#3D3D3A",
                      border: `0.5px solid ${isActive ? "transparent" : "#D8D2C4"}`,
                      borderRadius: 999, padding: "8px 14px",
                      fontSize: 12.5, fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 4px 10px -4px rgba(44,74,62,0.5)" : "none",
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search CTA */}
        {subCategory && (
          <button
            onClick={search}
            className="tap animate-fade-up"
            style={{
              height: 60, width: "100%",
              background: "#B85C3C", color: "#fff",
              border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 8px 18px -8px rgba(184,92,60,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="2.5" stroke="#fff" strokeWidth="1.8"/>
            </svg>
            {t("findPlace.search.searchBtn")}
          </button>
        )}

        {/* Tip */}
        <div style={{ padding: "12px 14px", background: "#EFEBE2", borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 14 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#6B6A63", lineHeight: 1.5 }}>
            {t("findPlace.search.tip")}
          </p>
        </div>
      </div>
    </div>
  );
}
