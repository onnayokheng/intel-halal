"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { type TripHistoryItem, deleteTripHistoryItem, clearTripHistory } from "@/lib/history";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const h   = Math.floor(diff / 3600000);
  const d   = Math.floor(diff / 86400000);
  if (diff < 60000)    return "baru saja";
  if (diff < 3600000)  return `${min} ${t("history.timeMinutes")}`;
  if (diff < 86400000) return `${h} ${t("history.timeHours")}`;
  return `${d} ${t("history.timeDays")}`;
}

export default function TripHistory({
  items: initialItems,
  onClose,
  onItemsChange,
}: {
  items: TripHistoryItem[];
  onClose: () => void;
  onItemsChange: (items: TripHistoryItem[]) => void;
}) {
  const [items, setItems] = useState<TripHistoryItem[]>(initialItems);
  const [detail, setDetail] = useState<TripHistoryItem | null>(null);

  const handleDelete = (id: string) => {
    const updated = deleteTripHistoryItem(id);
    setItems(updated);
    onItemsChange(updated);
    if (detail?.id === id) setDetail(null);
  };

  const handleClearAll = () => {
    if (!window.confirm(t("history.confirmClear"))) return;
    clearTripHistory();
    setItems([]);
    onItemsChange([]);
    onClose();
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 60,
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
        <button
          onClick={detail ? () => setDetail(null) : onClose}
          className="tap"
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: "#fff", border: "0.5px solid #E8E3D6",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, cursor: "pointer", flexShrink: 0,
            boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#1B1B19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.2, color: "#9B998F", textTransform: "uppercase" }}>Trip Plan</div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2, color: "#1B1B19", lineHeight: 1.1, marginTop: 1 }}>
            {t("tripHistory.title")}
          </div>
        </div>
        {!detail && items.length > 0 && (
          <button onClick={handleClearAll} className="tap" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#B85C3C" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Detail view ── */}
        {detail && (() => {
          const date = new Date(detail.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          return (
            <div className="animate-slide-in" style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Route */}
              <div style={{ background: "#2C4A3E", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{detail.origin}</div>
                  <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#fff" }}>→ {detail.destination}</div>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "#9B998F", letterSpacing: 0.3 }}>{date}</div>
              <div
                className="trip-content"
                style={{ background: "#fff", borderRadius: 18, padding: 18, border: "0.5px solid #E8E3D6", boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)" }}
                dangerouslySetInnerHTML={{ __html: detail.resultHtml }}
              />
              <button
                onClick={() => handleDelete(detail.id)}
                className="tap"
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 500, color: "#B85C3C", textDecoration: "underline", textUnderlineOffset: 3, padding: "8px 0", textAlign: "center" }}
              >
                {t("history.deleteItem")}
              </button>
            </div>
          );
        })()}

        {/* ── List view ── */}
        {!detail && (
          <div className="animate-fade-in" style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 10 }}>
            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: "#EFEBE2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3" stroke="#6B6A63" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#1B1B19", marginBottom: 6 }}>{t("tripHistory.empty")}</div>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B6A63", margin: 0, lineHeight: 1.5 }}>{t("tripHistory.emptyDesc")}</p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDetail(item)}
                  className="tap"
                  style={{
                    background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 16,
                    padding: "14px 14px", display: "flex", alignItems: "center", gap: 12,
                    textAlign: "left", cursor: "pointer",
                    boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
                  }}
                >
                  {/* Route icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#DFE8DA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="#2C4A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 600, color: "#1B1B19", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.origin} → {item.destination}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "#9B998F", marginTop: 3 }}>{relativeTime(item.timestamp)}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M9 6l6 6-6 6" stroke="#6B6A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
