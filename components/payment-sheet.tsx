"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface PaymentData {
  subscriptionId: string;
  qrString: string;
  payUrl: string | null;
  amount: number;
  reference: string;
  instructions: { title: string; steps: string[] }[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function QRCode({ data }: { data: string }) {
  const url = encodeURIComponent(data);
  return (
    <div style={{
      width: 220, height: 220, margin: "0 auto",
      borderRadius: 16, overflow: "hidden",
      border: "0.5px solid #E8E3D6",
      boxShadow: "0 4px 16px -4px rgba(27,27,25,0.12)",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="QRIS" width={220} style={{ display: "block" }} />
    </div>
  );
}

export default function PaymentSheet({
  plan, onClose, onSuccess,
}: {
  plan: "7day" | "30day";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<"loading" | "qr" | "checking" | "error">("loading");
  const [payment, setPayment] = useState<PaymentData | null>(null);
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
        setState("checking");
        setTimeout(() => onSuccess(), 1200);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [state, payment, onSuccess]);

  return (
    <div
      className="animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: "#2C4A3E", marginBottom: 6 }}>
            QRIS
          </div>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: -0.4, margin: 0, color: "#1B1B19" }}>
            Scan & Bayar
          </h3>
          {payment && (
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "#1B1B19", marginTop: 6, letterSpacing: -0.3 }}>
              {formatRupiah(payment.amount)}
            </div>
          )}
        </div>

        {/* States */}
        {state === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E8E3D6", borderTopColor: "#2C4A3E" }} className="animate-spin-slow" />
            <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B6A63" }}>Membuat transaksi...</span>
          </div>
        )}

        {state === "qr" && payment && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <QRCode data={payment.qrString} />
            <div style={{
              padding: "10px 16px", background: "#DFE8DA", borderRadius: 10,
              fontFamily: "var(--font-jakarta)", fontSize: 12.5, color: "#2C4A3E",
              textAlign: "center", lineHeight: 1.5,
            }}>
              Buka aplikasi GoPay, OVO, Dana, atau bank kamu → scan QRIS ini
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9B998F", letterSpacing: 0.4 }}>
              ref: {payment.reference}
            </div>
          </div>
        )}

        {state === "checking" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#DFE8DA",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="#2C4A3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="serif" style={{ fontSize: 18, color: "#1B1B19" }}>Pembayaran berhasil!</span>
          </div>
        )}

        {state === "error" && (
          <div style={{ padding: "16px 0" }}>
            <div style={{ padding: "14px 16px", background: "#F1D5C7", borderRadius: 12, marginBottom: 16, fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B2F1D" }}>
              {errorMsg}
            </div>
            <button onClick={onClose} className="tap" style={{
              width: "100%", height: 48, background: "transparent",
              border: "0.5px solid #D8D2C4", borderRadius: 14, cursor: "pointer",
              fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, color: "#6B6A63",
            }}>
              Tutup
            </button>
          </div>
        )}

        {/* Close — only on qr state */}
        {state === "qr" && (
          <button onClick={onClose} className="tap" style={{
            marginTop: 16, width: "100%", height: 48, background: "transparent",
            border: "0.5px solid #D8D2C4", borderRadius: 14, cursor: "pointer",
            fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, color: "#6B6A63",
          }}>
            Bayar Nanti
          </button>
        )}
      </div>
    </div>
  );
}
