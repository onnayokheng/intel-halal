"use client";

import { useEffect, useState } from "react";

interface PaymentRow {
  id: string;
  plan: string;
  amountIdr: number;
  status: string;
  paymentRef: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const PLAN_LABEL: Record<string, string> = { "7day": "7 Hari", "30day": "1 Bulan" };

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  active:    { bg: "#DFE8DA", fg: "#1F362D", label: "Aktif" },
  pending:   { bg: "#FDE68A", fg: "#78350F", label: "Menunggu" },
  cancelled: { bg: "#EFEBE2", fg: "#6B6A63", label: "Dibatalkan" },
  expired:   { bg: "#F1D5C7", fg: "#6B2F1D", label: "Kedaluwarsa" },
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

export default function PaymentHistory({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/payments")
      .then((r) => r.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 85,
        maxWidth: 430, margin: "0 auto",
        background: "#F7F5F0",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 5,
        padding: "16px 14px 12px",
        display: "flex", alignItems: "center", gap: 10,
        background: "#F7F5F0", borderBottom: "0.5px solid #E8E3D6",
      }}>
        <button onClick={onClose} className="tap" style={{
          width: 36, height: 36, borderRadius: 12,
          background: "#fff", border: "0.5px solid #E8E3D6",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, cursor: "pointer", flexShrink: 0,
          boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#1B1B19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.2, color: "#9B998F", textTransform: "uppercase" }}>Akun</div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2, color: "#1B1B19", lineHeight: 1.1, marginTop: 1 }}>Riwayat Pembayaran</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 10 }}>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #E8E3D6", borderTopColor: "#2C4A3E" }} className="animate-spin-slow" />
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "#EFEBE2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="3" stroke="#6B6A63" strokeWidth="1.6"/>
                <path d="M2 10h20" stroke="#6B6A63" strokeWidth="1.6"/>
              </svg>
            </div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#1B1B19", marginBottom: 6 }}>Belum ada transaksi</div>
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B6A63", margin: 0 }}>Riwayat pembayaran premium akan muncul di sini</p>
          </div>
        )}

        {!loading && rows.map((row) => {
          const st = STATUS_STYLE[row.status] ?? STATUS_STYLE.cancelled;
          return (
            <div key={row.id} style={{
              background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
            }}>
              {/* Top row: plan + status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#1B1B19" }}>
                    Premium {PLAN_LABEL[row.plan] ?? row.plan}
                  </div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#2C4A3E", marginTop: 2, letterSpacing: -0.3 }}>
                    {formatRupiah(row.amountIdr)}
                  </div>
                </div>
                <div style={{ background: st.bg, color: st.fg, borderRadius: 8, padding: "5px 11px", fontFamily: "var(--font-jakarta)", fontSize: 11.5, fontWeight: 700 }}>
                  {st.label}
                </div>
              </div>

              {/* Detail rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "0.5px solid #F0EBE0", paddingTop: 12 }}>
                <Row label="Tanggal beli" value={formatDate(row.createdAt)} />
                {row.startsAt  && <Row label="Mulai"    value={formatDate(row.startsAt)} />}
                {row.expiresAt && <Row label="Berakhir" value={formatDate(row.expiresAt)} />}
                {row.paymentRef && <Row label="Ref"     value={row.paymentRef} mono />}
              </div>

              {/* Cancel button — only for pending */}
              {row.status === "pending" && (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/payment/cancel", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subscriptionId: row.id }),
                    }).catch(() => null);
                    if (res?.ok) {
                      setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "cancelled" } : r));
                    }
                  }}
                  className="tap"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    marginTop: 10, padding: "6px 0", width: "100%", textAlign: "center",
                    fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 500,
                    color: "#B85C3C", textDecoration: "underline", textUnderlineOffset: 3,
                  }}
                >
                  Batalkan Transaksi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 12, color: "#9B998F" }}>{label}</span>
      <span style={{ fontFamily: mono ? "var(--font-mono)" : "var(--font-jakarta)", fontSize: 12, color: "#3D3D3A", fontWeight: 500, textAlign: "right", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
