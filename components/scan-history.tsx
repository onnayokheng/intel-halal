"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { type HistoryItem, deleteHistoryItem, clearHistory } from "@/lib/history";

const VERDICT = {
  halal:   { bg: "#DFE8DA", fg: "#1F362D", label: "Halal" },
  syubhat: { bg: "#F4E4BF", fg: "#5A4116", label: "Syubhat" },
  haram:   { bg: "#F1D5C7", fg: "#6B2F1D", label: "Haram" },
} as const;

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const h   = Math.floor(diff / 3600000);
  const d   = Math.floor(diff / 86400000);
  if (diff < 60000)       return "baru saja";
  if (diff < 3600000)     return `${min} ${t("history.timeMinutes")}`;
  if (diff < 86400000)    return `${h} ${t("history.timeHours")}`;
  return `${d} ${t("history.timeDays")}`;
}

export default function ScanHistory({
  items: initialItems,
  onClose,
  onItemsChange,
}: {
  items: HistoryItem[];
  onClose: () => void;
  onItemsChange: (items: HistoryItem[]) => void;
}) {
  const [items, setItems] = useState<HistoryItem[]>(initialItems);
  const [detail, setDetail] = useState<HistoryItem | null>(null);

  const handleDelete = (id: string) => {
    const updated = deleteHistoryItem(id);
    setItems(updated);
    onItemsChange(updated);
    if (detail?.id === id) setDetail(null);
  };

  const handleClearAll = () => {
    if (!window.confirm(t("history.confirmClear"))) return;
    clearHistory();
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
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.2, color: "#9B998F", textTransform: "uppercase" }}>
            Cek Halal
          </div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2, color: "#1B1B19", lineHeight: 1.1, marginTop: 1 }}>
            {t("history.title")}
          </div>
        </div>

        {!detail && items.length > 0 && (
          <button onClick={handleClearAll} className="tap" style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 8, color: "#B85C3C",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Detail view ── */}
        {detail && (() => {
          const v = VERDICT[detail.status];
          const date = new Date(detail.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          return (
            <div className="animate-slide-in" style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Status badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: v.bg, borderRadius: 999, padding: "8px 16px", alignSelf: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: v.fg }}>{v.label}</span>
              </div>
              {/* Timestamp */}
              <div className="mono" style={{ fontSize: 10.5, color: "#9B998F", letterSpacing: 0.3 }}>{date}</div>
              {/* Result HTML */}
              <div
                className="ai-content"
                style={{ background: "#fff", borderRadius: 18, padding: 18, border: "0.5px solid #E8E3D6", boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)" }}
                dangerouslySetInnerHTML={{ __html: detail.resultHtml }}
              />
              {/* Delete button */}
              <button
                onClick={() => handleDelete(detail.id)}
                className="tap"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 500,
                  color: "#B85C3C", textDecoration: "underline", textUnderlineOffset: 3,
                  padding: "8px 0", textAlign: "center",
                }}
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
                    <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#6B6A63" strokeWidth="1.6" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="#6B6A63" strokeWidth="1.6"/>
                  </svg>
                </div>
                <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#1B1B19", marginBottom: 6 }}>{t("history.empty")}</div>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, color: "#6B6A63", margin: 0, lineHeight: 1.5 }}>{t("history.emptyDesc")}</p>
              </div>
            ) : (
              items.map((item) => {
                const v = VERDICT[item.status];
                return (
                  <button
                    key={item.id}
                    onClick={() => setDetail(item)}
                    className="tap"
                    style={{
                      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 16,
                      padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                      textAlign: "left", cursor: "pointer",
                      boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#EFEBE2" }}>
                      {item.thumbnail
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#9B998F" strokeWidth="1.6" strokeLinejoin="round"/>
                              <circle cx="12" cy="13" r="4" stroke="#9B998F" strokeWidth="1.6"/>
                            </svg>
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: v.bg, color: v.fg, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", padding: "2px 7px", borderRadius: 999 }}>
                          {v.label}
                        </span>
                        <span className="mono" style={{ fontSize: 10, color: "#9B998F" }}>{relativeTime(item.timestamp)}</span>
                      </div>
                      <div style={{
                        fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 500,
                        color: "#3D3D3A", lineHeight: 1.35,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {item.title || v.label}
                      </div>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M9 6l6 6-6 6" stroke="#6B6A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
