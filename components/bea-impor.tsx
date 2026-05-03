"use client";

import { useState, useEffect } from "react";

type Currency = "JPY" | "USD" | "SGD" | "MYR";
interface Rates { IDR: number; JPY: number; SGD: number; MYR: number; }
interface Result {
  priceUsd: number; priceIdr: number; taxableUsd: number;
  ndpz: number; bm: number; ni: number; ppn: number; pph: number;
  totalTax: number; usdToIdr: number; jpyToIdr: number;
}

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="tap"
      style={{
        width: 52, height: 30, borderRadius: 15,
        background: on ? "#2C4A3E" : "#D8D2C4",
        border: "none", padding: 2,
        display: "flex", alignItems: "center",
        transition: "background 200ms ease",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        transform: on ? "translateX(22px)" : "translateX(0)",
        transition: "transform 200ms cubic-bezier(.2,.7,.2,1)",
      }} />
    </button>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3D3D3A", marginBottom: 6, letterSpacing: 0.1 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "#9B998F", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

export default function BeaImpor() {
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [price, setPrice]       = useState("128000");
  const [hasNpwp, setHasNpwp]   = useState(true);
  const [rates, setRates]       = useState<Rates | null>(null);
  const [result, setResult]     = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => setRates(d.rates))
      .catch(() => {});
  }, []);

  const calculate = () => {
    const parsed = Math.max(0, parseFloat(price));
    if (!parsed || isNaN(parsed) || !rates) return;
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const { IDR: usdToIdr, JPY: jpyToUsd, SGD: sgdToUsd, MYR: myrToUsd } = rates;
      let priceIdr = 0;
      if (currency === "USD") priceIdr = parsed * usdToIdr;
      else if (currency === "JPY") priceIdr = parsed * (usdToIdr / jpyToUsd);
      else if (currency === "SGD") priceIdr = parsed * (usdToIdr / sgdToUsd);
      else if (currency === "MYR") priceIdr = parsed * (usdToIdr / myrToUsd);
      const priceUsd = priceIdr / usdToIdr;
      const taxableUsd = Math.max(0, priceUsd - 500);
      const ndpz = taxableUsd * usdToIdr;
      const bm   = Math.ceil(0.10 * ndpz);
      const ni   = ndpz + bm;
      const ppn  = Math.ceil(0.11 * ni);
      const pph  = Math.ceil((hasNpwp ? 0.10 : 0.20) * ni);
      setResult({ priceUsd, priceIdr, taxableUsd, ndpz, bm, ni, ppn, pph,
        totalTax: Math.ceil(bm + ppn + pph), usdToIdr, jpyToIdr: (usdToIdr / jpyToUsd) * 100 });
      setIsLoading(false);
    }, 1100);
  };

  const CURRENCIES: Currency[] = ["JPY", "USD", "SGD", "MYR"];
  const SYMBOL: Record<Currency, string> = { JPY: "¥", USD: "$", SGD: "S$", MYR: "RM" };

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 96, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "72px 22px 18px" }}>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6, margin: "0 0 8px", lineHeight: 1.05 }}>
          Bea Impor
        </h1>
        <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
          Hitung pajak IMEI HP yang dibeli di Jepang sebelum sampai bea cukai Indonesia.
        </p>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Form card */}
        <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <div style={{ padding: "18px 18px 6px" }}>
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
              Detail pembelian
            </div>

            <FieldRow label="Mata uang">
              <div style={{ display: "flex", background: "#EFEBE2", borderRadius: 12, padding: 4, gap: 2 }}>
                {CURRENCIES.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} className="tap" style={{
                    flex: 1, border: "none",
                    background: currency === c ? "#fff" : "transparent",
                    color: currency === c ? "#1B1B19" : "#6B6A63",
                    padding: "8px 0", borderRadius: 9,
                    fontFamily: "var(--font-jetbrains)", fontSize: 12, fontWeight: 600,
                    boxShadow: currency === c ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                    transition: "background 150ms ease, color 150ms ease",
                  }}>{c}</button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Harga HP">
              <div style={{
                position: "relative", background: "#EFEBE2", borderRadius: 12,
                padding: "14px 14px", display: "flex", alignItems: "baseline", gap: 8,
              }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "#6B6A63" }}>
                  {SYMBOL[currency]}
                </span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && calculate()}
                  inputMode="numeric"
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    fontFamily: "var(--font-jetbrains)", fontSize: 22, fontWeight: 600,
                    color: "#1B1B19", minWidth: 0,
                  }}
                />
              </div>
            </FieldRow>

            <FieldRow
              label="Punya NPWP?"
              hint={hasNpwp ? "Tarif PPh 22 lebih rendah (10%)" : "Tarif PPh 22 lebih tinggi (20%)"}
            >
              <Toggle on={hasNpwp} onChange={setHasNpwp} />
            </FieldRow>
          </div>

          <div style={{ padding: "12px 18px 18px" }}>
            <button
              onClick={calculate}
              disabled={!rates || !price}
              className="tap"
              style={{
                height: 60, width: "100%",
                background: !rates || !price ? "#D8D2C4" : "#2C4A3E",
                color: "#fff", border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 600, cursor: !rates || !price ? "not-allowed" : "pointer",
                boxShadow: !rates || !price ? "none" : "0 8px 18px -8px rgba(44,74,62,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: !rates ? 0.6 : 1,
              }}
            >
              {!rates ? "Memuat kurs…" : "Hitung Bea Impor"}
              {rates && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: "18px 22px", boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 14 }} className="animate-fade-in">
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ animation: "spin .9s linear infinite", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9" fill="none" stroke="#2C4A3E" strokeOpacity="0.18" strokeWidth="2.4"/>
              <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="#2C4A3E" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Menghitung pajak…</div>
              <div style={{ fontSize: 12, color: "#6B6A63", marginTop: 2 }}>Cek kurs realtime + tarif bea cukai.</div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Total box */}
            <div style={{
              background: "#DFE8DA",
              border: "0.5px solid rgba(44,74,62,0.18)",
              borderRadius: 18, padding: "22px 22px", textAlign: "center",
              boxShadow: "var(--shadow-card)",
            }}>
              <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 1.4, color: "#2C4A3E", opacity: 0.7, marginBottom: 8 }}>
                ESTIMASI PAJAK
              </div>
              <div className="serif" style={{
                fontSize: 36, fontWeight: 600, letterSpacing: -0.8,
                color: "#1F362D", lineHeight: 1,
              }}>
                {result.totalTax === 0 ? "Bebas Pajak" : formatRp(result.totalTax)}
              </div>
              <div style={{ fontSize: 13, marginTop: 8, color: "#2C4A3E" }}>
                {result.totalTax === 0
                  ? "Harga di bawah limit $500 — aman!"
                  : `Kena pajak dari selisih $${result.taxableUsd.toFixed(2)}`}
              </div>
            </div>

            {/* Total modal */}
            <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: 18, boxShadow: "var(--shadow-card)" }}>
              <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
                Total Modal Keseluruhan
              </div>
              <div className="serif" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: "#1B1B19" }}>
                {formatRp(result.priceIdr + result.totalTax + 25000)}
              </div>
              <div style={{ fontSize: 11, color: "#9B998F", marginTop: 4 }}>*Termasuk harga HP, pajak & biaya bank (Rp 25.000)</div>
            </div>

            {/* Kurs */}
            <div style={{ background: "#EFEBE2", borderRadius: 14, padding: "14px 16px" }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "#9B998F", marginBottom: 8 }}>
                Kurs Referensi (Realtime)
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span className="mono" style={{ color: "#6B6A63" }}>1 USD</span>
                <span className="mono" style={{ fontWeight: 600 }}>{formatRp(result.usdToIdr)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                <span className="mono" style={{ color: "#6B6A63" }}>100 JPY</span>
                <span className="mono" style={{ fontWeight: 600 }}>{formatRp(result.jpyToIdr)}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: 18, boxShadow: "var(--shadow-card)" }}>
              <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 14 }}>
                Rincian Perhitungan
              </div>
              {[
                { label: "Nilai Barang (USD)", value: `$${result.priceUsd.toFixed(2)}`, mono: true },
                { label: "Pembebasan Bea", value: "-$500.00", mono: true, green: true },
              ].map(({ label, value, mono, green }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "#6B6A63" }}>{label}</span>
                  <span className={mono ? "mono" : ""} style={{ fontWeight: 600, color: green ? "#2C4A3E" : "#1B1B19" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, borderTop: "1px solid #E8E3D6", paddingTop: 10, marginTop: 6 }}>
                <span>Dasar Pajak (NDPZ)</span>
                <span className="mono" style={{ color: "#B85C3C" }}>{formatRp(result.ndpz)}</span>
              </div>
              <div style={{ background: "#EFEBE2", borderRadius: 12, padding: "12px 14px", marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["1. Bea Masuk (10%)", formatRp(result.bm)],
                  ["2. PPN (11%)", formatRp(result.ppn)],
                  [`3. PPh (${hasNpwp ? "10%" : "20%"})`, formatRp(result.pph)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6B6A63" }}>{l}</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: "#F0E2C2", border: "0.5px solid rgba(200,146,58,0.25)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <p style={{ margin: 0, fontSize: 12, color: "#5A4116", lineHeight: 1.5 }}>
                Estimasi menggunakan logika Kurs Kemenkeu. Lapor di <strong>Jalur Merah</strong> untuk mendapatkan batas bebas $500.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
