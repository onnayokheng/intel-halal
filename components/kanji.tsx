"use client";

import { useState, useMemo } from "react";

type Verdict = "halal" | "syubhat" | "haram";

interface Category {
  id: string;
  name: string;
  tone: Verdict;
  sample: string[];
  desc: string;
}

interface Entry {
  id: string;
  cat: string;
  kanji: string;
  kana: string;
  romaji: string;
  verdict: Verdict;
  arti: string;
  foundIn: string[];
  tips: string;
  related: string[];
}

const KANJI_CATEGORIES: Category[] = [
  { id: "pork",     name: "Babi & turunannya",       tone: "haram",   sample: ["豚", "ラード"], desc: "Babi dan turunan langsung — selalu haram" },
  { id: "alcohol",  name: "Alkohol & fermentasi",    tone: "haram",   sample: ["酒", "みりん"], desc: "Sake, mirin, dan turunan fermentasi alkohol" },
  { id: "additive", name: "Aditif syubhat",          tone: "syubhat", sample: ["乳化剤", "ショートニング"], desc: "Emulsifier, shortening, perisa — sumber tidak jelas" },
  { id: "meat",     name: "Daging perlu cek",        tone: "syubhat", sample: ["鶏", "牛"], desc: "Ayam, sapi — perlu cek metode penyembelihan" },
  { id: "seafood",  name: "Seafood halal",           tone: "halal",   sample: ["魚", "海老"], desc: "Ikan dan udang — umumnya halal" },
  { id: "plant",    name: "Nabati aman",             tone: "halal",   sample: ["大豆", "小麦"], desc: "Kedelai, gandum, dan bahan nabati lain" },
  { id: "sweets",   name: "Manis & dessert",         tone: "halal",   sample: ["砂糖", "ハチミツ"], desc: "Gula, madu, dan pemanis alami" },
  { id: "sauce",    name: "Saus & bumbu",            tone: "syubhat", sample: ["醤油", "味噌"], desc: "Shoyu, miso, dashi — periksa kandungan alkohol/ikan" },
];

const KANJI_ENTRIES: Entry[] = [
  { id: "buta", cat: "pork", kanji: "豚", kana: "ぶた", romaji: "buta", verdict: "haram",
    arti: "Babi. Dagingnya haram dikonsumsi sesuai syariat Islam.",
    foundIn: ["豚カツ (tonkatsu)", "豚骨ラーメン (tonkotsu ramen)", "チャーシュー (chashu)", "ハム & ソーセージ"],
    tips: "Jika kanji 豚 muncul di komposisi atau nama produk — langsung skip. Termasuk turunan: 豚脂, 豚由来, 豚ゼラチン.",
    related: ["ラード", "豚脂", "豚ゼラチン", "ハム"] },
  { id: "lard", cat: "pork", kanji: "ラード", kana: "らーど", romaji: "rādo", verdict: "haram",
    arti: "Lard — lemak babi yang dilelehkan. Sering jadi minyak goreng dan shortening.",
    foundIn: ["Mi instan kuah tonkotsu", "Roti & pastry murah", "Kerupuk & snack gorengan", "Margarin non-halal"],
    tips: "Beda dengan 牛脂 (gyū-shi, lemak sapi) dan 植物油脂 (minyak nabati). Kalau ragu antara ラード dan ショートニング, anggap syubhat.",
    related: ["豚", "ショートニング", "牛脂", "植物油脂"] },
  { id: "sake", cat: "alcohol", kanji: "酒", kana: "さけ", romaji: "sake", verdict: "haram",
    arti: "Sake — minuman beralkohol dari fermentasi beras. Juga muncul sebagai bumbu masak (料理酒).",
    foundIn: ["料理酒 (cooking sake)", "Saus teriyaki", "Marinade ikan", "Beberapa miso & shoyu"],
    tips: "Termasuk varian 清酒, 日本酒, 料理酒. Jika tertulis di komposisi makanan, pertimbangkan haram meski sudah dimasak.",
    related: ["みりん", "料理酒", "清酒", "焼酎"] },
  { id: "mirin", cat: "alcohol", kanji: "みりん", kana: "みりん", romaji: "mirin", verdict: "haram",
    arti: "Mirin — bumbu manis dengan kandungan alkohol 8–14%. Versi 本みりん adalah yang paling tinggi alkoholnya.",
    foundIn: ["Saus teriyaki & yakitori", "Tsuyu (kuah soba)", "Nikujaga & masakan stew Jepang", "Sushi rice (kadang)"],
    tips: "みりん風調味料 (mirin-fū) hanya rasa mirin tanpa alkohol — tetap cek labelnya. 本みりん = pasti beralkohol.",
    related: ["酒", "料理酒", "醤油", "だし"] },
  { id: "nyukazai", cat: "additive", kanji: "乳化剤", kana: "にゅうかざい", romaji: "nyūkazai", verdict: "syubhat",
    arti: "Emulsifier — pengikat minyak & air. Bisa berasal dari kedelai (halal) atau lemak hewan (haram/syubhat).",
    foundIn: ["Cokelat & wafer", "Ice cream & susu", "Roti & kue", "Margarin"],
    tips: "Cari keterangan sumber: 乳化剤(大豆由来) artinya dari kedelai → halal. Tanpa keterangan = syubhat.",
    related: ["ショートニング", "香料", "大豆", "レシチン"] },
  { id: "shortening", cat: "additive", kanji: "ショートニング", kana: "しょーとにんぐ", romaji: "shōtoningu", verdict: "syubhat",
    arti: "Shortening — lemak padat untuk pastry. Bisa nabati (palem/kedelai) atau hewani (lard).",
    foundIn: ["Biskuit & cookies", "Pie crust & croissant", "Kue kering Jepang", "Donat"],
    tips: "Tanpa label \"vegetable\" / 植物性 → status syubhat. Kalau ada keterangan 植物油脂100% biasanya aman.",
    related: ["ラード", "乳化剤", "植物油脂", "マーガリン"] },
  { id: "kouryou", cat: "additive", kanji: "香料", kana: "こうりょう", romaji: "kōryō", verdict: "syubhat",
    arti: "Perisa/flavoring. Bisa nabati, sintetis, atau dari ekstrak hewan. Sumber jarang disebutkan eksplisit.",
    foundIn: ["Permen & coklat", "Minuman ringan", "Snack gurih", "Yogurt rasa"],
    tips: "Kalau hanya tertulis \"香料\" tanpa keterangan, anggap syubhat. Kontak produsen jika produk sering dikonsumsi.",
    related: ["乳化剤", "着色料", "酸味料", "甘味料"] },
  { id: "tori", cat: "meat", kanji: "鶏", kana: "とり", romaji: "tori", verdict: "syubhat",
    arti: "Ayam. Status tergantung metode penyembelihan — dzabihah (Islami) atau tidak.",
    foundIn: ["唐揚げ (karaage)", "チキンナゲット", "焼き鳥 (yakitori)", "Bakso & sosis"],
    tips: "Cari label \"Halal Chicken\" atau toko muslim. Rumah makan Jepang umumnya tidak menjamin penyembelihan halal.",
    related: ["牛", "鶏肉", "ハラルチキン", "鶏ガラ"] },
  { id: "gyuu", cat: "meat", kanji: "牛", kana: "うし", romaji: "gyū / ushi", verdict: "syubhat",
    arti: "Sapi. Sama seperti ayam — tergantung metode penyembelihan. Daging biasa di supermarket Jepang tidak halal.",
    foundIn: ["牛丼 (gyūdon)", "ステーキ", "ハンバーグ", "カレー (curry)"],
    tips: "Cari sertifikasi halal (印) atau supplier Australia/Brazil halal. Wagyu lokal Jepang umumnya non-halal.",
    related: ["鶏", "牛脂", "牛肉", "ハラル牛"] },
  { id: "sakana", cat: "seafood", kanji: "魚", kana: "さかな", romaji: "sakana", verdict: "halal",
    arti: "Ikan. Mayoritas mazhab menganggap semua ikan halal tanpa perlu disembelih.",
    foundIn: ["寿司 & 刺身", "焼き魚", "ちくわ & かまぼこ", "魚醤 (fish sauce)"],
    tips: "Hati-hati dengan saus pendamping — sering mengandung mirin atau sake. Sashimi mentah aman, sausnya yang perlu cek.",
    related: ["海老", "魚醤", "かつお", "のり"] },
  { id: "ebi", cat: "seafood", kanji: "海老", kana: "えび", romaji: "ebi", verdict: "halal",
    arti: "Udang. Halal menurut mayoritas mazhab (Syafi'i, Maliki, Hanbali). Mazhab Hanafi memiliki pandangan berbeda.",
    foundIn: ["天ぷら (tempura)", "海老フライ (ebi furai)", "えびせんべい", "寿司ネタ"],
    tips: "Tepung tempura kadang pakai telur & dashi — tetap cek komposisi. Saus celupan biasanya mengandung mirin.",
    related: ["魚", "カニ", "タコ", "イカ"] },
  { id: "daizu", cat: "plant", kanji: "大豆", kana: "だいず", romaji: "daizu", verdict: "halal",
    arti: "Kedelai. Bahan dasar tofu, miso, shoyu, natto, dan banyak emulsifier nabati.",
    foundIn: ["豆腐 (tofu)", "納豆 (natto)", "醤油 & 味噌", "Edamame & soy milk"],
    tips: "Keterangan \"大豆由来\" pada emulsifier = sinyal hijau. Tahu & soymilk plain hampir selalu aman.",
    related: ["小麦", "豆腐", "レシチン", "味噌"] },
  { id: "komugi", cat: "plant", kanji: "小麦", kana: "こむぎ", romaji: "komugi", verdict: "halal",
    arti: "Gandum. Bahan dasar mi, roti, tepung tempura, dan kebanyakan kue Jepang.",
    foundIn: ["うどん & ラーメン", "パン (roti)", "天ぷら粉", "お好み焼き"],
    tips: "Tepung sendiri halal, tapi olahannya sering dicampur dashi/lemak. Cek komposisi mi kering & roti komersial.",
    related: ["大豆", "米", "そば", "パン粉"] },
  { id: "satou", cat: "sweets", kanji: "砂糖", kana: "さとう", romaji: "satō", verdict: "halal",
    arti: "Gula. Putih, merah (黒糖), atau halus — semuanya halal sebagai bahan tunggal.",
    foundIn: ["Kue & permen", "Minuman ringan", "Saus teriyaki", "Roti"],
    tips: "Aman sendirian, tapi gula yang dipakai produk olahan tidak menjamin produk akhirnya halal.",
    related: ["ハチミツ", "黒糖", "甘味料", "果糖"] },
  { id: "hachimitsu", cat: "sweets", kanji: "ハチミツ", kana: "はちみつ", romaji: "hachimitsu", verdict: "halal",
    arti: "Madu. Halal dan dianjurkan dalam Islam.",
    foundIn: ["ハニートースト", "Yogurt madu", "Permen madu lemon", "Minuman herbal"],
    tips: "Kadang dicampur royal jelly atau ekstrak lain — cek label kalau bukan madu murni 100%.",
    related: ["砂糖", "メープルシロップ", "黒糖", "甘味料"] },
  { id: "shouyu", cat: "sauce", kanji: "醤油", kana: "しょうゆ", romaji: "shōyu", verdict: "syubhat",
    arti: "Shoyu/kecap asin Jepang. Proses fermentasinya menghasilkan alkohol — kandungan akhir 1–3%.",
    foundIn: ["Hampir semua masakan Jepang", "Sushi & sashimi", "Mi & tsuyu", "Saus teriyaki"],
    tips: "Cari shoyu sertifikasi halal (Kikkoman Halal, dll) atau yang berlabel \"アルコール無添加\". Versi standar = syubhat.",
    related: ["味噌", "みりん", "だし", "酒"] },
  { id: "miso", cat: "sauce", kanji: "味噌", kana: "みそ", romaji: "miso", verdict: "syubhat",
    arti: "Pasta kedelai fermentasi. Mirip shoyu — fermentasi menghasilkan sedikit alkohol.",
    foundIn: ["味噌汁 (sup miso)", "Marinade ikan", "Ramen kuah miso", "Saus dengkulan"],
    tips: "Cari miso halal-certified. Kandungan alkohol biasanya <1% tapi tetap syubhat tanpa sertifikasi.",
    related: ["醤油", "だし", "大豆", "麹"] },
  { id: "dashi", cat: "sauce", kanji: "だし", kana: "だし", romaji: "dashi", verdict: "syubhat",
    arti: "Kaldu Jepang dari ikan (かつお), rumput laut (昆布), atau sardin (煮干し). Kadang dicampur sake/mirin.",
    foundIn: ["Sup miso & udon", "Onigiri filling", "Tamagoyaki", "Hampir semua kuah Jepang"],
    tips: "Dashi kombu murni = halal. Dashi pabrikan sering tambah ekstrak ayam/babi & mirin — cek 原材料名.",
    related: ["醤油", "味噌", "かつお", "昆布"] },
];

const VERDICT_META = {
  halal:   { label: "HALAL",   bg: "#DFE8DA", fg: "#2C4A3E", strong: "#1F362D", dot: "#2C4A3E" },
  syubhat: { label: "SYUBHAT", bg: "#F4E4BF", fg: "#7A5A1F", strong: "#5A4116", dot: "#C8923A" },
  haram:   { label: "HARAM",   bg: "#F1D5C7", fg: "#93462C", strong: "#6B2F1D", dot: "#B85C3C" },
} as const;

type View = "browse" | "list" | "detail";

export default function KamusKanji({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("browse");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Verdict>("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFav = (id: string) => setFavorites((f) => ({ ...f, [id]: !f[id] }));

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
            Referensi
          </div>
          <div className="serif" style={{
            fontSize: 17, fontWeight: 600, letterSpacing: -0.2, color: "#1B1B19", lineHeight: 1.1, marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Kamus Kanji Halal
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, fontWeight: 500, color: "#6B6A63", letterSpacing: 0.4, flexShrink: 0 }}>
          {KANJI_ENTRIES.length} kata
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "detail" && detailEntry ? (
          <KanjiDetail
            entry={detailEntry}
            isFav={!!favorites[detailEntry.id]}
            onFav={() => toggleFav(detailEntry.id)}
            onOpenRelated={(rkanji) => {
              const target = KANJI_ENTRIES.find((e) => e.kanji === rkanji);
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
    { id: "all", label: "Semua" },
    { id: "haram", label: "Haram", tone: "haram" },
    { id: "syubhat", label: "Syubhat", tone: "syubhat" },
    { id: "halal", label: "Halal-aman", tone: "halal" },
  ];
  const activeCategoryObj = KANJI_CATEGORIES.find((c) => c.id === activeCat);

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
          placeholder="Cari kanji, romaji, atau arti..."
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
          const meta = f.tone ? VERDICT_META[f.tone] : null;
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
            Telusuri per kategori
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {KANJI_CATEGORIES.map((cat) => {
              const count = KANJI_ENTRIES.filter((e) => e.cat === cat.id).length;
              const meta = VERDICT_META[cat.tone];
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
                    }}>{count} kosakata</span>
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
              {activeCategoryObj ? activeCategoryObj.name : query ? `Hasil untuk "${query}"` : "Semua kosakata"}
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
  const meta = VERDICT_META[entry.verdict];
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
        Belum ada di kamus
      </div>
      <p style={{ margin: "6px auto 16px", fontSize: 13, color: "#6B6A63", lineHeight: 1.5, maxWidth: 280 }}>
        Kosakata yang kamu cari belum ada. Coba scan langsung lewat <b>Cek Halal</b> — AI bisa baca kanji apa pun di kemasan.
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
        Coba scan lewat Cek Halal
      </button>
    </div>
  );
}

function KanjiDetail({
  entry, isFav, onFav, onOpenRelated,
}: {
  entry: Entry;
  isFav: boolean;
  onFav: () => void;
  onOpenRelated: (k: string) => void;
}) {
  const meta = VERDICT_META[entry.verdict];

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
          Arti
        </div>
        <p style={{ margin: 0, fontSize: 14.5, color: "#3D3D3A", lineHeight: 1.55 }}>{entry.arti}</p>
      </div>

      {/* Found in */}
      <div style={{
        background: "#fff", border: "0.5px solid #E8E3D6", borderRadius: 18,
        padding: 18, boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
      }}>
        <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 12 }}>
          Sering ditemukan di
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
          Tips
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
            Kanji terkait
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {entry.related.map((r, i) => {
              const target = KANJI_ENTRIES.find((e) => e.kanji === r);
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

      {/* Favorite */}
      <button
        onClick={onFav}
        className="tap"
        style={{
          height: 52, width: "100%",
          background: isFav ? "#2C4A3E" : "#fff",
          color: isFav ? "#fff" : "#1B1B19",
          border: isFav ? "none" : "1px solid #D8D2C4",
          borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: isFav ? "0 8px 18px -8px rgba(44,74,62,0.55)" : "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "#fff" : "none"}>
          <path d="M12 21s-7-4.5-7-10.5A4.5 4.5 0 0112 6a4.5 4.5 0 017 4.5C19 16.5 12 21 12 21z"
                stroke={isFav ? "#fff" : "#1B1B19"} strokeWidth="1.7" strokeLinejoin="round"/>
        </svg>
        {isFav ? "Tersimpan di favorit" : "Tambah ke favorit"}
      </button>
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
