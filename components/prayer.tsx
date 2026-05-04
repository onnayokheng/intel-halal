"use client";

import { useState } from "react";

const PRAYERS = [
  { id: "subuh",   label: "Subuh",   arabic: "الفجر",  time: "03:24" },
  { id: "dzuhur",  label: "Dzuhur",  arabic: "الظهر",  time: "11:34" },
  { id: "ashar",   label: "Ashar",   arabic: "العصر",  time: "15:18" },
  { id: "maghrib", label: "Maghrib", arabic: "المغرب", time: "18:42" },
  { id: "isya",    label: "Isya",    arabic: "العشاء", time: "20:14" },
];

const HISAB_METHODS = [
  { id: "kemenag",  label: "Kemenag RI",          meta: "Subuh 20° · Isya 18°" },
  { id: "mwl",      label: "Muslim World League", meta: "Subuh 18° · Isya 17°" },
  { id: "egyptian", label: "Egyptian Authority",  meta: "Subuh 19.5° · Isya 17.5°" },
];

type State = "loading" | "denied" | "located" | "active-prayer";

export default function PrayerSchedule() {
  const [state, setState] = useState<State>("located");
  const [showSettings, setShowSettings] = useState(false);
  const [hisab, setHisab] = useState("kemenag");

  const nextPrayer = PRAYERS.find((p) => p.id === "maghrib")!;
  const retry = () => {
    setState("loading");
    setTimeout(() => setState("located"), 1800);
  };

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 96, overflowY: "auto", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "72px 22px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6, margin: "0 0 8px", lineHeight: 1.05 }}>
            Jadwal Sholat
          </h1>
          <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
            Waktu sholat & arah kiblat berdasarkan lokasi kamu di Jepang.
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
          aria-label="Pengaturan"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {state === "loading" && <LoadingCard />}
        {state === "denied" && <DeniedCard onRetry={retry} />}

        {(state === "located" || state === "active-prayer") && (
          <>
            <LocationStrip />
            {state === "active-prayer"
              ? <ActivePrayerBanner prayer={{ label: "Maghrib", time: "18:42", remaining: "23 menit" }} />
              : <NextPrayerHero prayer={nextPrayer} remaining="2 jam 14 menit" />
            }
            <PrayerList activeId={state === "active-prayer" ? "maghrib" : null} nextId="maghrib" />
            <QiblaCompass degrees={293} />
            <FootnoteRow hisabLabel={HISAB_METHODS.find((m) => m.id === hisab)!.label} />
          </>
        )}

        <StateSwitcher state={state} setState={setState} />
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

function LocationStrip() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 4px" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" fill="#2C4A3E"/>
        <circle cx="12" cy="10" r="2.4" fill="#fff"/>
      </svg>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1B1B19" }}>
        Shinjuku, Tokyo, Japan
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: "#6B6A63", letterSpacing: 0.6 }}>
        4 Mei 2026 · 17 Dzulqa&apos;dah 1447
      </div>
    </div>
  );
}

function NextPrayerHero({ prayer, remaining }: { prayer: { label: string; time: string }; remaining: string }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      overflow: "hidden", position: "relative",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div className="star-bg" style={{ position: "absolute", inset: 0, opacity: 0.55, pointerEvents: "none" }} />
      <div style={{ position: "relative", padding: "22px 22px 24px" }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63" }}>
          Sholat Berikutnya
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
          Sebentar lagi {prayer.label.toLowerCase()}…
        </div>
        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
          background: "#D8E2DA", padding: "8px 12px", borderRadius: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2C4A3E" }} className="animate-pulse-ring" />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#1F362D", letterSpacing: 0.3 }}>
            {remaining} lagi
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivePrayerBanner({ prayer }: { prayer: { label: string; time: string; remaining: string } }) {
  return (
    <div style={{
      background: "#2C4A3E", border: "none", borderRadius: 18,
      overflow: "hidden", position: "relative",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div className="star-bg" style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", filter: "invert(1)" }} />
      <div style={{ position: "relative", padding: "22px" }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
          Saat Ini
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
          Waktunya menunaikan {prayer.label.toLowerCase()}.
        </div>
        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.14)", padding: "8px 12px", borderRadius: 10,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#fff" }} className="animate-pulse-ring" />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: 0.3 }}>
            Berakhir dalam {prayer.remaining}
          </span>
        </div>
      </div>
    </div>
  );
}

function PrayerList({ activeId, nextId }: { activeId: string | null; nextId: string }) {
  const nextIdx = PRAYERS.findIndex((p) => p.id === nextId);
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      {PRAYERS.map((p, i) => {
        const isActive = p.id === activeId;
        const isNext = !activeId && p.id === nextId;
        const isPassed = !activeId && nextIdx > i;

        return (
          <div
            key={p.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: i < PRAYERS.length - 1 ? "0.5px solid #E8E3D6" : "none",
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
              }}>{isActive ? "Sekarang" : "Berikutnya"}</span>
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

function QiblaCompass({ degrees }: { degrees: number }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      padding: 22, position: "relative", overflow: "hidden",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 4 }}>
        Arah Kiblat
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: "#1B1B19", letterSpacing: -0.4 }}>
        Hadap ke Mekkah
      </div>
      <div style={{ fontSize: 12, color: "#6B6A63", marginTop: 2 }}>
        Putar perangkat sampai jarum sejajar dengan ka&apos;bah.
      </div>

      <div style={{
        position: "relative", width: "100%", aspectRatio: "1 / 1",
        marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CompassDial degrees={degrees} />
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", color: "#6B6A63" }}>Arah</div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: "#2C4A3E", letterSpacing: -0.4, marginTop: 2 }}>
            {degrees}° <span style={{ fontSize: 14, color: "#6B6A63", fontWeight: 500 }}>Barat-Laut</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", color: "#6B6A63" }}>Jarak</div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "#1B1B19", marginTop: 2 }}>9,738 km</div>
        </div>
      </div>
    </div>
  );
}

function CompassDial({ degrees }: { degrees: number }) {
  const ticks: React.ReactElement[] = [];
  for (let d = 0; d < 360; d += 15) {
    const major = d % 90 === 0;
    const mid = d % 45 === 0 && !major;
    const x1 = 50 + Math.sin((d * Math.PI) / 180) * 47;
    const y1 = 50 - Math.cos((d * Math.PI) / 180) * 47;
    const x2 = 50 + Math.sin((d * Math.PI) / 180) * (major ? 41 : mid ? 43 : 44.5);
    const y2 = 50 - Math.cos((d * Math.PI) / 180) * (major ? 41 : mid ? 43 : 44.5);
    ticks.push(
      <line key={d} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={major ? "#1B1B19" : "rgba(27,27,25,0.35)"}
            strokeWidth={major ? 0.8 : 0.4} strokeLinecap="round" />
    );
  }

  const cardinals = [
    { d: 0, label: "U" }, { d: 90, label: "T" },
    { d: 180, label: "S" }, { d: 270, label: "B" },
  ];

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="dial-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7F5F0" />
          <stop offset="78%" stopColor="#EFEBE2" />
          <stop offset="100%" stopColor="#E5DFD2" />
        </radialGradient>
        <linearGradient id="needle" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#2C4A3E" />
          <stop offset="100%" stopColor="#1F362D" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#dial-bg)" stroke="#D8D2C4" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(27,27,25,0.08)" strokeWidth="0.4" />

      <g transform="translate(50 50)">
        <path d="M0 -22 L4.5 -8 L18 -4 L4.5 0 L0 22 L-4.5 0 L-18 -4 L-4.5 -8 Z"
              fill="none" stroke="rgba(44,74,62,0.10)" strokeWidth="0.6" />
        <path d="M0 -28 L5.5 -10 L22 -5 L5.5 0 L0 28 L-5.5 0 L-22 -5 L-5.5 -10 Z"
              fill="none" stroke="rgba(44,74,62,0.06)" strokeWidth="0.4" />
      </g>

      {ticks}

      {cardinals.map((c) => {
        const x = 50 + Math.sin((c.d * Math.PI) / 180) * 36;
        const y = 50 - Math.cos((c.d * Math.PI) / 180) * 36;
        return (
          <text key={c.d} x={x} y={y + 1.6}
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontSize="6.2" fontWeight="600"
                fill={c.label === "U" ? "#B85C3C" : "#3D3D3A"}>
            {c.label}
          </text>
        );
      })}

      <g transform={`rotate(${degrees} 50 50)`}>
        <path d="M50 4 L52 8 L48 8 Z" fill="#2C4A3E" />
        <text x="50" y="13" textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="3.4" fontWeight="600" fill="#2C4A3E"
              letterSpacing="0.3">QIBLAT</text>
      </g>

      <g transform={`rotate(${degrees} 50 50)`}>
        <path d="M50 16 L46.5 50 L50 84 L53.5 50 Z" fill="rgba(27,27,25,0.10)" transform="translate(0.6 0.8)" />
        <path d="M50 16 L46.8 50 L50 50 Z" fill="url(#needle)" />
        <path d="M50 16 L53.2 50 L50 50 Z" fill="#3F6A58" />
        <path d="M50 84 L47 50 L50 50 Z" fill="#9B998F" />
        <path d="M50 84 L53 50 L50 50 Z" fill="#7A7872" />
        <circle cx="50" cy="16" r="1.6" fill="#B85C3C" />
      </g>

      <circle cx="50" cy="50" r="3.4" fill="#1B1B19" />
      <circle cx="50" cy="50" r="1.4" fill="#F7F5F0" />
    </svg>
  );
}

function FootnoteRow({ hisabLabel }: { hisabLabel: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px 0", gap: 12 }}>
      <div style={{ fontSize: 11.5, color: "#6B6A63", lineHeight: 1.4 }}>
        Metode hisab: <span style={{ color: "#1B1B19", fontWeight: 600 }}>{hisabLabel}</span>
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: "#9B998F", letterSpacing: 1, textTransform: "uppercase" }}>
        WIB+2 · JST
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
        Mencari arah…
      </div>
      <div style={{ fontSize: 13, color: "#6B6A63", marginTop: 6, lineHeight: 1.4, maxWidth: 280, margin: "6px auto 0" }}>
        Mendeteksi GPS dan kompas perangkat. Mohon tunggu sebentar.
      </div>
      <div className="mono" style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 18, fontSize: 10.5, color: "#9B998F", letterSpacing: 0.6 }}>
        <span>● GPS</span><span>● COMPASS</span><span>● HISAB</span>
      </div>
    </div>
  );
}

function DeniedCard({ onRetry }: { onRetry: () => void }) {
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
        Izin lokasi diperlukan
      </div>
      <div style={{ fontSize: 13, color: "#6B6A63", marginTop: 6, lineHeight: 1.45, maxWidth: 300, margin: "6px auto 0" }}>
        Tanpa GPS, kami tidak dapat menghitung waktu sholat & arah kiblat yang akurat untuk lokasi kamu di Jepang.
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
        Aktifkan Lokasi
      </button>
      <button className="tap" style={{
        marginTop: 8, background: "transparent", border: "none",
        color: "#6B6A63", fontSize: 12.5, padding: 8, cursor: "pointer",
      }}>
        Atau pilih lokasi manual
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
          Pilih metode perhitungan waktu sholat. Default: Kemenag RI untuk warga Indonesia.
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

function StateSwitcher({ state, setState }: { state: State; setState: (s: State) => void }) {
  const STATES: { id: State; label: string }[] = [
    { id: "located", label: "Default" },
    { id: "active-prayer", label: "Saat Maghrib" },
    { id: "loading", label: "Loading" },
    { id: "denied", label: "Izin ditolak" },
  ];
  return (
    <div style={{
      marginTop: 8, padding: "14px 14px 16px",
      borderRadius: 14, background: "#EFEBE2",
      border: "0.5px dashed #D8D2C4",
    }}>
      <div className="mono" style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#9B998F", marginBottom: 8 }}>
        Demo · Pratinjau Status
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setState(s.id)}
            className="tap"
            style={{
              background: state === s.id ? "#1B1B19" : "#fff",
              color: state === s.id ? "#fff" : "#3D3D3A",
              border: "0.5px solid #D8D2C4",
              borderRadius: 999, padding: "6px 11px",
              fontSize: 11.5, fontWeight: 500, cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
