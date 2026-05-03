"use client";

import { useState } from "react";
import DOMPurify from "dompurify";

export default function TripPlan() {
  const [origin, setOrigin]           = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [resultHtml, setResultHtml]   = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const go = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setIsLoading(true); setResultHtml(null); setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
      setResultHtml(DOMPurify.sanitize(data.result));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyusun rute. Pastikan koneksi stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setResultHtml(null); setOrigin(""); setDestination(""); setError(null); };

  const inputStyle = {
    width: "100%", border: "none", background: "transparent", outline: "none",
    fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 500,
    color: "#1B1B19", padding: "14px 14px",
  };

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 96, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "72px 22px 18px" }}>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6, margin: "0 0 8px", lineHeight: 1.05 }}>
          Trip Plan
        </h1>
        <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
          AI bikin panduan rute kereta atau bus Jepang gaya cerita — biar gak bingung di Shinkansen.
        </p>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Input card */}
        <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <div style={{ padding: "18px 18px 6px" }}>
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 14 }}>
              Mau ke mana?
            </div>

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Connector line */}
              <div style={{
                position: "absolute", left: 17, top: 22, bottom: 22, width: 1.5,
                background: "#D8D2C4", zIndex: 0,
              }} />

              {/* Origin */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: "#EFEBE2", border: "2px solid #2C4A3E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2C4A3E" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#9B998F", textTransform: "uppercase", marginBottom: 2 }}>Dari</div>
                  <div style={{ background: "#EFEBE2", borderRadius: 10 }}>
                    <input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Shinjuku Station"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "#2C4A3E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 10px -4px rgba(44,74,62,0.5)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" fill="#fff" fillOpacity="0.9"/>
                    <circle cx="12" cy="10" r="2.5" fill="#2C4A3E"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#9B998F", textTransform: "uppercase", marginBottom: 2 }}>Ke</div>
                  <div style={{ background: "#EFEBE2", borderRadius: 10 }}>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && go()}
                      placeholder="Tokyo Tower"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 18px 18px" }}>
            <button
              onClick={go}
              disabled={!origin.trim() || !destination.trim()}
              className="tap"
              style={{
                height: 60, width: "100%",
                background: !origin.trim() || !destination.trim() ? "#D8D2C4" : "#2C4A3E",
                color: "#fff", border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                cursor: !origin.trim() || !destination.trim() ? "not-allowed" : "pointer",
                boxShadow: !origin.trim() || !destination.trim() ? "none" : "0 8px 18px -8px rgba(44,74,62,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 4h11a3 3 0 010 6H8a3 3 0 000 6h11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="5" cy="4" r="1.8" fill="#fff"/>
                <circle cx="19" cy="16" r="1.8" fill="#fff"/>
              </svg>
              GO
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: "24px 22px", boxShadow: "var(--shadow-card)", textAlign: "center" }} className="animate-fade-in">
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ animation: "spin .9s linear infinite", margin: "0 auto 12px" }}>
              <circle cx="12" cy="12" r="9" fill="none" stroke="#2C4A3E" strokeOpacity="0.18" strokeWidth="2.4"/>
              <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="#2C4A3E" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Menganalisis stasiun & jalur…</div>
            <div style={{ fontSize: 12, color: "#6B6A63", marginTop: 4 }}>Mencari kombinasi kereta dan bus terbaik.</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "14px 16px", background: "#F1D5C7", border: "0.5px solid rgba(147,70,44,0.22)", borderRadius: 14, display: "flex", gap: 10, alignItems: "flex-start" }} className="animate-fade-in">
            <span style={{ fontSize: 16 }}>⚠</span>
            <p style={{ margin: 0, fontSize: 13, color: "#6B2F1D", lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {resultHtml && !isLoading && (
          <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div dangerouslySetInnerHTML={{ __html: resultHtml }} style={{ width: "100%" }} />
            <button
              onClick={reset}
              className="tap"
              style={{
                height: 52, width: "100%",
                background: "#fff", color: "#3D3D3A",
                border: "1px solid #D8D2C4", borderRadius: 14,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              Rencana baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
