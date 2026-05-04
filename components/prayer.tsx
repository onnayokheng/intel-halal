"use client";

import { useState, useEffect, useCallback } from "react";
import { t, ta } from "@/lib/i18n";
import {
  HIJRI_MONTHS_ID, PRAYER_LABELS_ID, PRAYER_ARABIC, PRAYER_ORDER,
  type PrayerKey, type PrayerData, type PrayerComputed,
  fetchPrayerTimes, getCurrentLocation, reverseGeocode,
  findCurrentPrayer, formatRemaining,
} from "@/lib/prayer";

const HISAB_METHODS = [
  { id: "kemenag",  label: t("sholat.hisabSettings.methods.kemenag"),  meta: t("sholat.hisabSettings.meta.kemenag") },
  { id: "mwl",      label: t("sholat.hisabSettings.methods.mwl"),      meta: t("sholat.hisabSettings.meta.mwl") },
  { id: "egyptian", label: t("sholat.hisabSettings.methods.egyptian"), meta: t("sholat.hisabSettings.meta.egyptian") },
];

interface CacheEntry {
  prayerData: PrayerData;
  locationName: string;
  lat: number;
  lng: number;
}

const cacheKey = (date: Date, hisab: string) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `intel-halal-prayer-${date.getFullYear()}-${mm}-${dd}-${hisab}`;
};

export default function PrayerSchedule() {
  const [hisab, setHisab] = useState("mwl");
  const [showSettings, setShowSettings] = useState(false);

  const [coords, setCoords]             = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [prayerData, setPrayerData]     = useState<PrayerData | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [now, setNow] = useState<Date>(new Date());

  // ─── Load prayer data (cache → API) ───
  const loadData = useCallback(async (lat: number, lng: number, method: string, force = false) => {
    setError(null);
    try {
      const today = new Date();
      const key = cacheKey(today, method);

      if (!force) {
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        if (cached) {
          try {
            const entry: CacheEntry = JSON.parse(cached);
            if (
              entry.prayerData.fetchedAt === todayStr() &&
              Math.abs(entry.lat - lat) < 0.01 &&
              Math.abs(entry.lng - lng) < 0.01
            ) {
              setPrayerData(entry.prayerData);
              setLocationName(entry.locationName);
              return;
            }
          } catch { /* corrupted cache, refetch */ }
        }
      }

      const [data, name] = await Promise.all([
        fetchPrayerTimes(lat, lng, method, today),
        reverseGeocode(lat, lng),
      ]);

      setPrayerData(data);
      setLocationName(name);

      const entry: CacheEntry = { prayerData: data, locationName: name, lat, lng };
      try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* quota */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    }
  }, []);

  // ─── Detect location + load (initial mount or manual refresh) ───
  const detectAndLoad = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const c = await getCurrentLocation();
      setCoords(c);
      await loadData(c.lat, c.lng, hisab, force);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lokasi tidak terdeteksi";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [hisab, loadData]);

  useEffect(() => { detectAndLoad(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when hisab changes (cache aware)
  useEffect(() => {
    if (coords) loadData(coords.lat, coords.lng, hisab);
  }, [hisab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick countdown every second
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ─── Derived state ───
  const computed = prayerData ? findCurrentPrayer(prayerData.timings, now) : null;
  const view: "loading" | "denied" | "located" | "active-prayer" =
    isLoading                    ? "loading"
    : error && !prayerData       ? "denied"
    : computed?.active           ? "active-prayer"
    : "located";

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 96, overflowY: "auto", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "72px 22px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6, margin: "0 0 8px", lineHeight: 1.05 }}>
            {t("sholat.title")}
          </h1>
          <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
            {t("sholat.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="tap"
          style={{
            background: "#EFEBE2", border: "0.5px solid #D8D2C4",
            width: 38, height: 38, borderRadius: 12, marginTop: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#3D3D3A", cursor: "pointer", flexShrink: 0,
          }}
          aria-label={t("sholat.settings")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {view === "loading" && <LoadingCard />}
        {view === "denied" && <DeniedCard onRetry={() => detectAndLoad(true)} message={error ?? undefined} />}

        {(view === "located" || view === "active-prayer") && prayerData && computed && (
          <>
            <LocationStrip
              location={locationName}
              gregorianDate={prayerData.gregorianDate}
              hijriDay={prayerData.hijriDay}
              hijriMonth={prayerData.hijriMonth}
              hijriYear={prayerData.hijriYear}
              isRefreshing={isRefreshing}
              onRefresh={() => detectAndLoad(true)}
            />

            {view === "active-prayer" && computed.active
              ? <ActivePrayerBanner prayer={computed.active} />
              : <NextPrayerHero prayer={computed.next} remainingMs={computed.remainingMs} />
            }

            <PrayerList
              timings={prayerData.timings}
              now={now}
              activeId={computed.active?.id ?? null}
              nextId={computed.next.id}
            />

            <FootnoteRow hisabLabel={HISAB_METHODS.find((m) => m.id === hisab)!.label} />
          </>
        )}
      </div>

      {showSettings && (
        <SettingsSheet
          hisab={hisab}
          setHisab={setHisab}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ─────── helpers ───────
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─────── sub-components ───────

function LocationStrip({
  location, gregorianDate, hijriDay, hijriMonth, hijriYear, isRefreshing, onRefresh,
}: {
  location: string;
  gregorianDate: string;
  hijriDay: string;
  hijriMonth: number;
  hijriYear: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#fff", border: "0.5px solid #E8E3D6",
      borderRadius: 14, padding: "10px 12px",
      boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: "#D8E2DA",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" fill="#2C4A3E"/>
          <circle cx="12" cy="10" r="2.4" fill="#fff"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1B1B19", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {location || "Lokasi terdeteksi"}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "#6B6A63", letterSpacing: 0.4, marginTop: 2 }}>
          {gregorianDate} · {hijriDay} {HIJRI_MONTHS_ID[hijriMonth] || ""} {hijriYear}
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="tap"
        aria-label="Cek lokasi sekarang"
        style={{
          background: isRefreshing ? "#EFEBE2" : "#fff",
          border: "0.5px solid #D8D2C4",
          width: 36, height: 36, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#3D3D3A", cursor: isRefreshing ? "wait" : "pointer", flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ animation: isRefreshing ? "spin .9s linear infinite" : "none" }}>
          <path d="M21 12a9 9 0 1 1-3-6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M21 4v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function NextPrayerHero({ prayer, remainingMs }: { prayer: PrayerComputed; remainingMs: number }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      overflow: "hidden", position: "relative",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div className="star-bg" style={{ position: "absolute", inset: 0, opacity: 0.55, pointerEvents: "none" }} />
      <div style={{ position: "relative", padding: "22px 22px 24px" }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63" }}>
          {t("sholat.nextPrayer")}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 12 }}>
          <div className="serif" style={{ fontSize: 44, fontWeight: 500, letterSpacing: -1, lineHeight: 1, color: "#1B1B19" }}>
            {prayer.label}
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: "#2C4A3E", letterSpacing: 0.5 }}>
            {prayer.time}
          </div>
        </div>
        <div className="serif" style={{ marginTop: 8, fontSize: 18, fontStyle: "italic", color: "#3D3D3A", fontWeight: 400, lineHeight: 1.3 }}>
          {t("sholat.soonCopy")} {prayer.label.toLowerCase()}…
        </div>
        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
          background: "#D8E2DA", padding: "8px 12px", borderRadius: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2C4A3E" }} className="animate-pulse-ring" />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#1F362D", letterSpacing: 0.3 }}>
            {formatRemaining(remainingMs)} lagi
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivePrayerBanner({ prayer }: { prayer: PrayerComputed }) {
  return (
    <div style={{
      background: "#2C4A3E", borderRadius: 18, overflow: "hidden", position: "relative",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div className="star-bg" style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", filter: "invert(1)" }} />
      <div style={{ position: "relative", padding: "22px" }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
          {t("sholat.currentLabel")}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 12 }}>
          <div className="serif" style={{ fontSize: 44, fontWeight: 500, letterSpacing: -1, lineHeight: 1, color: "#fff" }}>
            {prayer.label}
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.78)", letterSpacing: 0.5 }}>
            {prayer.time}
          </div>
        </div>
        <div className="serif" style={{ marginTop: 8, fontSize: 18, fontStyle: "italic", color: "rgba(255,255,255,0.82)", fontWeight: 400, lineHeight: 1.3 }}>
          {t("sholat.activeCopy")} {prayer.label.toLowerCase()}.
        </div>
        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.14)", padding: "8px 12px", borderRadius: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#fff" }} className="animate-pulse-ring" />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: 0.3 }}>
            {t("sholat.activeNote")}
          </span>
        </div>
      </div>
    </div>
  );
}

function PrayerList({
  timings, now, activeId, nextId,
}: {
  timings: Record<PrayerKey, string>;
  now: Date;
  activeId: string | null;
  nextId: string;
}) {
  const rows = PRAYER_ORDER.map((k) => {
    const [h, m] = timings[k].split(":").map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return {
      id: k.toLowerCase(),
      label: PRAYER_LABELS_ID[k],
      arabic: PRAYER_ARABIC[k],
      time: timings[k],
      date: d,
    };
  });

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      {rows.map((p, i) => {
        const isActive = p.id === activeId;
        const isNext = !activeId && p.id === nextId;
        const isPassed = p.date < now && !isActive;

        return (
          <div
            key={p.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: i < rows.length - 1 ? "0.5px solid #E8E3D6" : "none",
              background: isActive ? "#2C4A3E" : isNext ? "#D8E2DA" : "transparent",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isActive ? "rgba(255,255,255,0.16)"
                : isNext ? "rgba(44,74,62,0.14)"
                : isPassed ? "transparent" : "#EFEBE2",
            }}>
              {isPassed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l4 4L19 7" stroke="#9B998F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span className="serif" style={{
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? "#fff" : isNext ? "#1F362D" : "#6B6A63",
                }}>{i + 1}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: isActive ? "#fff" : "#1B1B19", opacity: isPassed ? 0.55 : 1 }}>
                {p.label}
              </div>
              <div className="serif" style={{
                fontSize: 11.5, marginTop: 1, fontStyle: "italic",
                color: isActive ? "rgba(255,255,255,0.65)" : "#9B998F",
                opacity: isPassed ? 0.55 : 1,
              }}>{p.arabic}</div>
            </div>
            {(isActive || isNext) && (
              <span style={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: 0.2,
                background: isActive ? "rgba(255,255,255,0.18)" : "#fff",
                color: isActive ? "#fff" : "#1F362D",
                padding: "4px 10px", borderRadius: 999,
                border: isActive ? "0.5px solid rgba(255,255,255,0.2)" : "0.5px solid rgba(44,74,62,0.18)",
              }}>{isActive ? t("sholat.chipNow") : t("sholat.chipNext")}</span>
            )}
            <div className="mono" style={{
              fontSize: 16, fontWeight: 500,
              color: isActive ? "#fff" : "#1B1B19",
              opacity: isPassed ? 0.5 : 1,
              letterSpacing: 0.5, minWidth: 60, textAlign: "right",
            }}>{p.time}</div>
          </div>
        );
      })}
    </div>
  );
}

function FootnoteRow({ hisabLabel }: { hisabLabel: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px 0", gap: 12 }}>
      <div style={{ fontSize: 11.5, color: "#6B6A63", lineHeight: 1.4 }}>
        {t("sholat.hisabMethod")}: <span style={{ color: "#1B1B19", fontWeight: 600 }}>{hisabLabel}</span>
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: "#9B998F", letterSpacing: 1, textTransform: "uppercase" }}>
        {t("sholat.aladhanAttr")}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      padding: 22, textAlign: "center",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div style={{ position: "relative", width: 56, height: 56, margin: "4px auto 14px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#2C4A3E", opacity: 0.18 }} className="animate-locating" />
        <div style={{
          position: "absolute", inset: 16, borderRadius: "50%", background: "#2C4A3E",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin .9s linear infinite" }}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="2.4" />
            <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: "#1B1B19", letterSpacing: -0.4 }}>
        {t("sholat.loading.title")}
      </div>
      <div style={{ fontSize: 13, color: "#6B6A63", marginTop: 6, lineHeight: 1.4, maxWidth: 280, margin: "6px auto 0" }}>
        {t("sholat.loading.desc")}
      </div>
    </div>
  );
}

function DeniedCard({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      padding: 22, textAlign: "center",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div style={{
        width: 56, height: 56, margin: "4px auto 14px",
        borderRadius: 16, background: "#F1DACB",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="#93462C" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M9 9l6 6M15 9l-6 6" stroke="#93462C" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: "#1B1B19", letterSpacing: -0.4 }}>
        {t("sholat.denied.title")}
      </div>
      <div style={{ fontSize: 13, color: "#6B6A63", marginTop: 6, lineHeight: 1.45, maxWidth: 300, margin: "6px auto 0" }}>
        {message ?? t("sholat.denied.desc")}
      </div>
      <button
        onClick={onRetry}
        className="tap"
        style={{
          marginTop: 16, height: 52, width: "100%",
          background: "#2C4A3E", color: "#fff",
          border: "none", borderRadius: 14,
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 8px 18px -8px rgba(44,74,62,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.6"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        {t("sholat.denied.retryBtn")}
      </button>
    </div>
  );
}

function SettingsSheet({
  hisab, setHisab, onClose,
}: { hisab: string; setHisab: (id: string) => void; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      maxWidth: 430, margin: "0 auto",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div onClick={onClose} className="animate-fade-in" style={{
        position: "absolute", inset: 0, background: "rgba(27,27,25,0.34)", backdropFilter: "blur(2px)",
      }} />
      <div className="animate-fade-up" style={{
        position: "relative", background: "#F7F5F0",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "14px 22px 38px",
        boxShadow: "0 -10px 40px -10px rgba(43,32,15,0.30)",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#D8D2C4", margin: "0 auto 18px" }} />
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63" }}>
          Pengaturan
        </div>
        <div className="serif" style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.4, color: "#1B1B19", marginTop: 4 }}>
          Metode Hisab
        </div>
        <div style={{ fontSize: 12.5, color: "#6B6A63", marginTop: 4, lineHeight: 1.45 }}>
          {t("sholat.hisabSettings.desc")}
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {HISAB_METHODS.map((m) => {
            const active = m.id === hisab;
            return (
              <button
                key={m.id}
                onClick={() => setHisab(m.id)}
                className="tap"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: active ? "#D8E2DA" : "#EFEBE2",
                  border: active ? "1px solid rgba(44,74,62,0.32)" : "0.5px solid #E8E3D6",
                  borderRadius: 14, textAlign: "left", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 99,
                  border: `2px solid ${active ? "#2C4A3E" : "#D8D2C4"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "#2C4A3E" : "#fff",
                  flexShrink: 0,
                }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: 99, background: "#fff" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1B1B19" }}>{m.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: "#6B6A63", marginTop: 2 }}>{m.meta}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="tap"
          style={{
            marginTop: 18, height: 52, width: "100%",
            background: "#2C4A3E", color: "#fff",
            border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 8px 18px -8px rgba(44,74,62,0.55)",
          }}
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
