"use client";

import { t, ta } from "@/lib/i18n";

import { useState, useMemo } from "react";

type Verdict = "halal" | "syubhat" | "haram";

interface Category { id: string; name: string; tone: Verdict; sample: string[]; desc: string; }
interface Entry { id: string; cat: string; kanji: string; kana: string; romaji: string; verdict: Verdict; arti: string; foundIn: string[]; tips: string; related: string[]; }

// ── Static (language-independent) data ──
const CAT_STATIC: { id: string; tone: Verdict; sample: string[] }[] = [
  { id: "pork",     tone: "haram",   sample: ["豚", "ラード"] },
  { id: "alcohol",  tone: "haram",   sample: ["酒", "みりん"] },
  { id: "additive", tone: "syubhat", sample: ["乳化剤", "ショートニング"] },
  { id: "meat",     tone: "syubhat", sample: ["鶏", "牛"] },
  { id: "seafood",  tone: "halal",   sample: ["魚", "海老"] },
  { id: "plant",    tone: "halal",   sample: ["大豆", "小麦"] },
  { id: "sweets",   tone: "halal",   sample: ["砂糖", "ハチミツ"] },
  { id: "sauce",    tone: "syubhat", sample: ["醤油", "味噌"] },
];

const ENTRY_STATIC: { id: string; cat: string; kanji: string; kana: string; romaji: string; verdict: Verdict; related: string[] }[] = [
  { id: "buta",       cat: "pork",     kanji: "豚",           kana: "ぶた",         romaji: "buta",       verdict: "haram",   related: ["ラード", "豚脂", "豚ゼラチン", "ハム"] },
  { id: "lard",       cat: "pork",     kanji: "ラード",        kana: "らーど",       romaji: "rādo",       verdict: "haram",   related: ["豚", "ショートニング", "牛脂", "植物油脂"] },
  { id: "sake",       cat: "alcohol",  kanji: "酒",           kana: "さけ",         romaji: "sake",       verdict: "haram",   related: ["みりん", "料理酒", "清酒", "焼酎"] },
  { id: "mirin",      cat: "alcohol",  kanji: "みりん",        kana: "みりん",       romaji: "mirin",      verdict: "haram",   related: ["酒", "料理酒", "醤油", "だし"] },
  { id: "nyukazai",   cat: "additive", kanji: "乳化剤",        kana: "にゅうかざい", romaji: "nyūkazai",   verdict: "syubhat", related: ["ショートニング", "香料", "大豆", "レシチン"] },
  { id: "shortening", cat: "additive", kanji: "ショートニング", kana: "しょーとにんぐ", romaji: "shōtoningu", verdict: "syubhat", related: ["ラード", "乳化剤", "植物油脂", "マーガリン"] },
  { id: "kouryou",    cat: "additive", kanji: "香料",          kana: "こうりょう",   romaji: "kōryō",      verdict: "syubhat", related: ["乳化剤", "着色料", "酸味料", "甘味料"] },
  { id: "tori",       cat: "meat",     kanji: "鶏",           kana: "とり",         romaji: "tori",       verdict: "syubhat", related: ["牛", "鶏肉", "ハラルチキン", "鶏ガラ"] },
  { id: "gyuu",       cat: "meat",     kanji: "牛",           kana: "うし",         romaji: "gyū / ushi", verdict: "syubhat", related: ["鶏", "牛脂", "牛肉", "ハラル牛"] },
  { id: "sakana",     cat: "seafood",  kanji: "魚",           kana: "さかな",       romaji: "sakana",     verdict: "halal",   related: ["海老", "魚醤", "かつお", "のり"] },
  { id: "ebi",        cat: "seafood",  kanji: "海老",          kana: "えび",         romaji: "ebi",        verdict: "halal",   related: ["魚", "カニ", "タコ", "イカ"] },
  { id: "daizu",      cat: "plant",    kanji: "大豆",          kana: "だいず",       romaji: "daizu",      verdict: "halal",   related: ["小麦", "豆腐", "レシチン", "味噌"] },
  { id: "komugi",     cat: "plant",    kanji: "小麦",          kana: "こむぎ",       romaji: "komugi",     verdict: "halal",   related: ["大豆", "米", "そば", "パン粉"] },
  { id: "satou",      cat: "sweets",   kanji: "砂糖",          kana: "さとう",       romaji: "satō",       verdict: "halal",   related: ["ハチミツ", "黒糖", "甘味料", "果糖"] },
  { id: "hachimitsu", cat: "sweets",   kanji: "ハチミツ",      kana: "はちみつ",     romaji: "hachimitsu", verdict: "halal",   related: ["砂糖", "メープルシロップ", "黒糖", "甘味料"] },
  { id: "shouyu",     cat: "sauce",    kanji: "醤油",          kana: "しょうゆ",     romaji: "shōyu",      verdict: "syubhat", related: ["味噌", "みりん", "だし", "酒"] },
  { id: "miso",       cat: "sauce",    kanji: "味噌",          kana: "みそ",         romaji: "miso",       verdict: "syubhat", related: ["醤油", "だし", "大豆", "麹"] },
  { id: "dashi",      cat: "sauce",    kanji: "だし",          kana: "だし",         romaji: "dashi",      verdict: "syubhat", related: ["醤油", "味噌", "かつお", "昆布"] },
];

// ── Translated getters (called at render time so locale is always current) ──
const getCategories = (): Category[] =>
  CAT_STATIC.map((c) => ({
    ...c,
    name: t(`kanji.categories.${c.id}`),
    desc: t(`kanji.categoryDesc.${c.id}`),
  }));

const getEntries = (): Entry[] =>
  ENTRY_STATIC.map((e) => ({
    ...e,
    arti:    t(`kanji.entries.${e.id}.arti`),
    tips:    t(`kanji.entries.${e.id}.tips`),
    foundIn: ta(`kanji.entries.${e.id}.foundIn`),
  }));

// Kept for backwards compat (length display) — computed once OK since count never changes
const KANJI_ENTRIES_COUNT = ENTRY_STATIC.length;

const VERDICT_STATIC = {
  halal:   { bg: "#DFE8DA", fg: "#2C4A3E", strong: "#1F362D", dot: "#2C4A3E" },
  syubhat: { bg: "#F4E4BF", fg: "#7A5A1F", strong: "#5A4116", dot: "#C8923A" },
  haram:   { bg: "#F1D5C7", fg: "#93462C", strong: "#6B2F1D", dot: "#B85C3C" },
} as const;

const getVerdictMeta = (verdict: Verdict) => ({
  ...VERDICT_STATIC[verdict],
  label: t(`kanji.verdicts.${verdict}`),
});

type View = "browse" | "list" | "detail";

export default function KamusKanji({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("browse");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Verdict>("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const onQueryChange = (q: string) => {
    setQuery(q);
    if (q.trim().length > 0 && view === "browse") setView("list");
    if (q.trim().length === 0 && !activeCat && filter === "all") setView("browse");
  };

  const onFilterChange = (f: "all" | Verdict) => {
    setFilter(f);
    if (f !== "all" && view === "browse") setView("list");
    if (f === "all" && query.trim() === "" && !activeCat) setView("browse");
  };

  const openCategory = (catId: string) => { setActiveCat(catId); setView("list"); };
  const openEntry = (id: string) => { setActiveEntry(id); setView("detail"); };
  const backToBrowse = () => { setView("browse"); setActiveCat(null); setQuery(""); setFilter("all"); };
  const backToList = () => setView(activeCat || query || filter !== "all" ? "list" : "browse");

  const KANJI_ENTRIES = getEntries();
  const KANJI_CATEGORIES = getCategories();

  const filteredEntries = useMemo(() => {
    let out = KANJI_ENTRIES;
    if (activeCat) out = out.filter((e) => e.cat === activeCat);
    if (filter !== "all") out = out.filter((e) => e.verdict === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((e) =>
        e.kanji.toLowerCase().includes(q) ||
        e.kana.toLowerCase().includes(q) ||
        e.romaji.toLowerCase().includes(q) ||
        e.arti.toLowerCase().includes(q)
      );
    }
    return out;
  }, [activeCat, filter, query]);

  const detailEntry = KANJI_ENTRIES.find((e) => e.id === activeEntry);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      maxWidth: 430, margin: "0 auto",
      background: "#F7F5F0",
      display: "flex", flexDirection: "column",
    }} className="animate-fade-in">

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 5,
        padding: "16px 14px 10px",
        display: "flex", alignItems: "center", gap: 10,
        background: "#F7F5F0", borderBottom: "0.5px solid #E8E3D6",
      }}>
        <button
          onClick={view === "detail" ? backToList : view === "list" ? backToBrowse : onClose}
          className="tap"
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: "#fff", border: "0.5px solid #E8E3D6",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
            flexShrink: 0, cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#1B1B19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.2, color: "#9B998F", textTransform: "uppercase" }}>
            {t("kanji.ref")}
          </div>
          <div className="serif" style={{
            fontSize: 17, fontWeight: 600, letterSpacing: -0.2, color: "#1B1B19", lineHeight: 1.1, marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {t("kanji.title")}
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, fontWeight: 500, color: "#6B6A63", letterSpacing: 0.4, flexShrink: 0 }}>
          {KANJI_ENTRIES_COUNT} {t("kanji.wordCount")}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "detail" && detailEntry ? (
          <KanjiDetail
            entry={detailEntry}
            onOpenRelated={(rkanji) => {
              const target = getEntries().find((e) => e.kanji === rkanji);
              if (target) openEntry(target.id);
            }}
          />
        ) : (
          <KanjiBrowseList
            view={view}
            query={query}
            filter={filter}
            activeCat={activeCat}
            filteredEntries={filteredEntries}
            onQueryChange={onQueryChange}
            onFilterChange={onFilterChange}
            openCategory={openCategory}
            openEntry={openEntry}
            onScanInstead={onClose}
          />
        )}
      </div>
    </div>
  );
}

function KanjiBrowseList({
  view, query, filter, activeCat, filteredEntries,
  onQueryChange, onFilterChange, openCategory, openEntry, onScanInstead,
}: {
  view: View;
  query: string;
  filter: "all" | Verdict;
  activeCat: string | null;
  filteredEntries: Entry[];
  onQueryChange: (q: string) => void;
  onFilterChange: (f: "all" | Verdict) => void;
  openCategory: (id: string) => void;
  openEntry: (id: string) => void;
  onScanInstead: () => void;
}) {
  const FILTERS: { id: "all" | Verdict; label: string; tone?: Verdict }[] = [
    { id: "all", label: t("kanji.filters.all") },
    { id: "haram", label: t("kanji.filters.haram"), tone: "haram" },
    { id: "syubhat", label: t("kanji.filters.syubhat"), tone: "syubhat" },
    { id: "halal", label: t("kanji.filters.halal"), tone: "halal" },
  ];
  const activeCategoryObj = getCategories().find((c) => c.id === activeCat);

  return (
    <div className="animate-fade-in" style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Search bar */}
      <div style={{
        position: "relative", background: "#fff",
        border: "0.5px solid #E8E3D6", borderRadius: 14,
        boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
        display: "flex", alignItems: "center", padding: "0 14px", height: 48,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" stroke="#6B6A63" strokeWidth="1.8"/>
          <path d="M20 20l-3.5-3.5" stroke="#6B6A63" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("kanji.searchPlaceholder")}
          style={{
            flex: 1, height: "100%", border: "none", outline: "none",
            background: "transparent", marginLeft: 10,
            fontFamily: "var(--font-jakarta)", fontSize: 14, color: "#1B1B19",
          }}
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="tap"
            style={{
              background: "#EFEBE2", border: "none",
              width: 22, height: 22, borderRadius: 11, padding: 0,
              fontSize: 12, color: "#6B6A63", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", margin: "0 -18px", padding: "0 18px", scrollbarWidth: "none" }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const meta = f.tone ? f.tone ? getVerdictMeta(f.tone) : null : null;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className="tap"
              style={{
                flexShrink: 0,
                background: active ? (meta ? meta.strong : "#2C4A3E") : "#fff",
                color: active ? "#fff" : "#3D3D3A",
                border: `0.5px solid ${active ? "transparent" : "#D8D2C4"}`,
                borderRadius: 999, padding: "8px 14px",
                fontSize: 12.5, fontWeight: 600, letterSpacing: 0.1,
                fontFamily: "var(--font-jakarta)",
                display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer",
                boxShadow: active ? "0 4px 10px -4px rgba(44,74,62,0.4)" : "none",
              }}
            >
              {meta && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: active ? "#fff" : meta.dot,
                }}/>
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Browse view */}
      {view === "browse" && (
        <>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginTop: 4 }}>
            {t("kanji.browseLabel")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {getCategories().map((cat) => {
              const count = ENTRY_STATIC.filter((e) => e.cat === cat.id).length;
              const meta = getVerdictMeta(cat.tone);
              return (
                <button
                  key={cat.id}
                  onClick={() => openCategory(cat.id)}
                  className="tap"
                  style={{
                    background: "#fff",
                    border: "0.5px solid #E8E3D6",
                    borderRadius: 16,
                    padding: 14, textAlign: "left", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: 10, minHeight: 138,
                    boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    {cat.sample.slice(0, 2).map((k, i) => (
                      <span key={i} className="serif" style={{
                        fontSize: 26, fontWeight: 500,
                        color: meta.strong, letterSpacing: -0.5, lineHeight: 1,
                      }}>{k}</span>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1B1B19", lineHeight: 1.25 }}>
                      {cat.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="mono" style={{
                      fontSize: 10.5, fontWeight: 600,
                      background: meta.bg, color: meta.strong,
                      padding: "3px 8px", borderRadius: 999, letterSpacing: 0.4,
                    }}>{count} {t("kanji.vocabCount")}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6l6 6-6 6" stroke="#6B6A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* List view */}
      {view === "list" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63" }}>
              {activeCategoryObj ? activeCategoryObj.name : query ? `Hasil untuk "${query}"` : t("kanji.allVocab")}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "#6B6A63" }}>{filteredEntries.length}</div>
          </div>

          {filteredEntries.length === 0 ? (
            <EmptyState onScan={onScanInstead} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredEntries.map((e) => (
                <KanjiListRow key={e.id} entry={e} onClick={() => openEntry(e.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KanjiListRow({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  const meta = getVerdictMeta(entry.verdict);
  return (
    <button
      onClick={onClick}
      className="tap"
      style={{
        background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 14,
        padding: "12px 14px", display: "flex", alignItems: "center", gap: 14,
        textAlign: "left", cursor: "pointer",
        boxShadow: "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
      }}
    >
      <div className="serif" style={{
        fontSize: 30, fontWeight: 500,
        color: meta.strong, letterSpacing: -0.6, lineHeight: 1,
        minWidth: 44, textAlign: "center", flexShrink: 0,
      }}>{entry.kanji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "#6B6A63", marginBottom: 2 }}>
          {entry.kana} · {entry.romaji}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "#1B1B19", lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {entry.arti}
        </div>
      </div>

      <div className="mono" style={{
        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6,
        color: meta.strong, textTransform: "uppercase",
        background: meta.bg, padding: "4px 8px", borderRadius: 6, flexShrink: 0,
      }}>{meta.label}</div>
    </button>
  );
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
      padding: 24, textAlign: "center",
      boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
    }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto 14px",
        borderRadius: 18, background: "#EFEBE2",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#6B6A63" strokeWidth="1.8"/>
          <path d="M20 20l-3.5-3.5" stroke="#6B6A63" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="serif" style={{ fontSize: 19, fontWeight: 500, letterSpacing: -0.3, color: "#1B1B19" }}>
        {t("kanji.empty.title")}
      </div>
      <p style={{ margin: "6px auto 16px", fontSize: 13, color: "#6B6A63", lineHeight: 1.5, maxWidth: 280 }}>
        {t("kanji.empty.desc")}
      </p>
      <button
        onClick={onScan}
        className="tap"
        style={{
          background: "#2C4A3E", color: "#fff", border: "none",
          borderRadius: 14, padding: "12px 18px",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 18px -8px rgba(44,74,62,0.55)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="1.6"/>
        </svg>
        {t("kanji.empty.scanBtn")}
      </button>
    </div>
  );
}

function KanjiDetail({
  entry, onOpenRelated,
}: {
  entry: Entry;
  onOpenRelated: (k: string) => void;
}) {
  const meta = getVerdictMeta(entry.verdict);

  return (
    <div className="animate-fade-in" style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Hero — giant kanji */}
      <div className="animate-fade-up" style={{
        background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 22,
        padding: "28px 22px 22px", textAlign: "center", position: "relative",
        boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
        overflow: "hidden",
      }}>
        <div className="star-bg" style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none" }} />

        <div className="serif" style={{
          position: "relative", fontSize: 96, fontWeight: 500,
          color: "#2C4A3E", letterSpacing: -2, lineHeight: 1, margin: "0 0 6px",
        }}>{entry.kanji}</div>

        <div className="mono" style={{
          position: "relative", fontSize: 12,
          color: "#6B6A63", letterSpacing: 0.3, marginBottom: 14,
        }}>
          {entry.kana} <span style={{ color: "#9B998F" }}>·</span> {entry.romaji}
        </div>

        <div style={{
          position: "relative",
          display: "inline-flex", alignItems: "center", gap: 8,
          background: meta.strong, color: "#fff",
          padding: "10px 18px", borderRadius: 999,
          boxShadow: "0 8px 18px -8px rgba(0,0,0,0.25)",
        }}>
          <VerdictIcon verdict={entry.verdict} />
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4 }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Meaning */}
      <div style={{
        background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
        padding: 18, boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
      }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 8 }}>
          {t("kanji.meaning")}
        </div>
        <p style={{ margin: 0, fontSize: 14.5, color: "#3D3D3A", lineHeight: 1.55 }}>{entry.arti}</p>
      </div>

      {/* Found in */}
      <div style={{
        background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
        padding: 18, boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
      }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
          {t("kanji.foundIn")}
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {entry.foundIn.map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#3D3D3A" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot, flexShrink: 0 }}/>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div style={{
        background: meta.bg, border: `0.5px solid ${meta.fg}33`, borderRadius: 18, padding: 18,
        boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
      }}>
        <div className="mono" style={{
          fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase",
          color: meta.strong, marginBottom: 8,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span className="serif" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16, borderRadius: "50%",
            background: meta.strong, color: "#fff",
            fontSize: 10, fontWeight: 700,
          }}>i</span>
          {t("kanji.tips")}
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: meta.strong, lineHeight: 1.55 }}>{entry.tips}</p>
      </div>

      {/* Related */}
      {entry.related && entry.related.length > 0 && (
        <div style={{
          background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18, padding: 18,
          boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
        }}>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
            {t("kanji.related")}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {entry.related.map((r, i) => {
              const target = getEntries().find((e) => e.kanji === r);
              const clickable = !!target;
              return (
                <button
                  key={i}
                  onClick={clickable ? () => onOpenRelated(r) : undefined}
                  className={clickable ? "tap" : ""}
                  style={{
                    background: "#EFEBE2", border: "0.5px solid #E8E3D6",
                    borderRadius: 999, padding: "8px 12px",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    cursor: clickable ? "pointer" : "default",
                    opacity: clickable ? 1 : 0.6,
                  }}
                >
                  <span className="serif" style={{
                    fontSize: 16, fontWeight: 500, color: "#2C4A3E",
                    letterSpacing: -0.3, lineHeight: 1,
                  }}>{r}</span>
                  {clickable && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6l6 6-6 6" stroke="#6B6A63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "halal") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (verdict === "syubhat") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>
      <circle cx="12" cy="18" r="1.5" fill="#fff"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M6 18L18 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/>
    </svg>
  );
}
