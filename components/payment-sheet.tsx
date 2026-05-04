"use client";

import { useState, useEffect } from "react";

interface PaymentData {
  subscriptionId: string;
  qrString: string;
  payUrl: string | null;
  amount: number;
  reference: string;
  instructions: { title: string; steps: string[] }[];
}

interface AccessPremium {
  type: "premium";
  expiresAt: string;
  plan: "7day" | "30day";
}

const PLAN_LABEL: Record<string, string> = { "7day": "7 Hari", "30day": "1 Bulan" };

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function QRCode({ data }: { data: string }) {
  const w = 220, h = Math.round(220 * (323 / 200));
  return (
    <div style={{ width: w, height: h, margin: "0 auto", borderRadius: 16, overflow: "hidden", border: "0.5px solid #E8E3D6", boxShadow: "0 4px 16px -4px rgba(27,27,25,0.12)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={data} alt="QRIS" width={w} height={h} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

export default function PaymentSheet({ plan, onClose, onSuccess }: {
  plan: "7day" | "30day";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<"loading" | "qr" | "success" | "error">("loading");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [accessInfo, setAccessInfo] = useState<AccessPremium | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setErrorMsg(data.error); setState("error"); return; }
        setPayment(data);
        setState("qr");
      })
      .catch(() => { setErrorMsg("Gagal menghubungi server."); setState("error"); });
  }, [plan]);

  // Poll status setiap 5 detik
  useEffect(() => {
    if (state !== "qr" || !payment) return;
    const id = setInterval(async () => {
      const res = await fetch("/api/payment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: payment.subscriptionId }),
      }).catch(() => null);
      if (!res) return;
      const data = await res.json().catch(() => null);
      if (data?.status === "active") {
        clearInterval(id);
        // Fetch full access info for success screen
        fetch("/api/user/access")
          .then((r) => r.json())
          .then((info) => { if (info.type === "premium") setAccessInfo(info); })
          .catch(() => null);
        setState("success");
      }
    }, 5000);
    return () => clearInterval(id);
  }, [state, payment]);

  return (
    <div
      className="animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && state !== "success") onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        maxWidth: 430, margin: "0 auto",
        background: "rgba(27,27,25,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div
        className="animate-fade-up"
        style={{
          background: "#F7F5F0", borderRadius: "24px 24px 0 0",
          padding: "20px 22px 52px",
          boxShadow: "0 -8px 40px rgba(27,27,25,0.18)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "#D8D2C4", margin: "0 auto 20px" }} />

        {/* ── Loading ── */}
        {state === "loading" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: "#2C4A3E", marginBottom: 6 }}>QRIS</div>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: -0.4, margin: 0, color: "#1B1B19" }}>Scan & Bayar</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E8E3D6", borderTopColor: "#2C4A3E" }} className="animate-spin-slow" />
              <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B6A63" }}>Membuat transaksi...</span>
            </div>
          </>
        )}

        {/* ── QR ── */}
        {state === "qr" && payment && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: "#2C4A3E", marginBottom: 6 }}>QRIS</div>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: -0.4, margin: 0, color: "#1B1B19" }}>Scan & Bayar</h3>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "#1B1B19", marginTop: 6, letterSpacing: -0.3 }}>{formatRupiah(payment.amount)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <QRCode data={/^(data:image\/|https?:\/\/)/.test(payment.qrString) ? payment.qrString : ""} />
              <div style={{ padding: "10px 16px", background: "#DFE8DA", borderRadius: 10, fontFamily: "var(--font-jakarta)", fontSize: 12.5, color: "#2C4A3E", textAlign: "center", lineHeight: 1.5 }}>
                Buka aplikasi GoPay, OVO, Dana, atau bank kamu → scan QRIS ini
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9B998F", letterSpacing: 0.4 }}>
                ref: {payment.reference}
              </div>
            </div>
            <button onClick={onClose} className="tap" style={{ marginTop: 16, width: "100%", height: 48, background: "transparent", border: "0.5px solid #D8D2C4", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, color: "#6B6A63" }}>
              Bayar Nanti
            </button>
          </>
        )}

        {/* ── Success ── */}
        {state === "success" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, paddingBottom: 4 }}>
            {/* Checkmark */}
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DFE8DA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="#2C4A3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Headline */}
            <h3 className="serif" style={{ fontSize: 26, fontWeight: 400, letterSpacing: -0.5, margin: "0 0 8px", color: "#1B1B19", textAlign: "center" }}>
              Selamat, kamu sekarang <em style={{ fontStyle: "italic", color: "#2C4A3E" }}>Premium!</em>
            </h3>
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, color: "#6B6A63", margin: "0 0 24px", textAlign: "center", lineHeight: 1.5 }}>
              Pembayaran berhasil dikonfirmasi.
            </p>

            {/* Info card */}
            <div style={{ width: "100%", background: "#2C4A3E", borderRadius: 18, padding: "18px 20px", marginBottom: 16, boxShadow: "0 8px 24px -8px rgba(44,74,62,0.45)" }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                PAKET AKTIF
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 700, color: "#fff" }}>
                  Premium {accessInfo ? PLAN_LABEL[accessInfo.plan] : PLAN_LABEL[plan]}
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px" }}>
                  <div className="mono" style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: 0.4 }}>AKTIF</div>
                </div>
              </div>
              {accessInfo && (
                <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
                  Hingga {formatDate(accessInfo.expiresAt)}
                </div>
              )}
            </div>

            {/* CTA */}
            <button onClick={onSuccess} className="tap" style={{
              width: "100%", height: 56,
              background: "#B85C3C", color: "#fff",
              border: "none", borderRadius: 14, cursor: "pointer",
              fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700,
              boxShadow: "0 8px 18px -8px rgba(184,92,60,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="1.6"/>
              </svg>
              Mulai Scan
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div style={{ padding: "16px 0" }}>
            <div style={{ padding: "14px 16px", background: "#F1D5C7", borderRadius: 12, marginBottom: 16, fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B2F1D" }}>
              {errorMsg}
            </div>
            <button onClick={onClose} className="tap" style={{ width: "100%", height: 48, background: "transparent", border: "0.5px solid #D8D2C4", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, color: "#6B6A63" }}>
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
