"use client";

import { t, getLocale } from "@/lib/i18n";

import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { compressImage, parseStatus } from "@/lib/utils";
import KamusKanji from "@/components/kanji";

type Status = "idle" | "halal" | "syubhat" | "haram";

interface ImageItem { dataUrl: string; base64Data: string; mimeType: string; }

// ── Scan source icon components ──
function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}
function IconBarcode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6v12M7 6v12M10 6v12M13 6v9M16 6v12M19 6v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconGallery() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="9" cy="10.5" r="1.5" fill="currentColor"/>
      <path d="M5 18l5-5 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

function ScanSource({
  label, sub, icon, onClick, active,
}: {
  label: string; sub: string; icon: React.ReactNode;
  onClick: () => void; active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="tap"
      style={{
        background: active ? "#2C4A3E" : "#fff",
        color: active ? "#fff" : "#1B1B19",
        border: `0.5px solid ${active ? "transparent" : "#E8E3D6"}`,
        borderRadius: 16,
        padding: "14px 8px 12px",
        width: "100%", height: "100%", minHeight: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        boxShadow: active
          ? "0 8px 18px -8px rgba(44,74,62,0.55)"
          : "0 1px 0 rgba(43,32,15,.04), 0 6px 18px -8px rgba(43,32,15,.10)",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: active ? "rgba(255,255,255,0.18)" : "#EFEBE2",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 4,
        color: active ? "#fff" : "#2C4A3E",
      }}>{icon}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: active ? "rgba(255,255,255,0.7)" : "#9B998F" }}>{sub}</div>
    </button>
  );
}

function IngredientRow({ jp, en, tone }: { jp: string; en: string; tone: "halal" | "syubhat" | "haram" }) {
  const cfg = {
    halal:   { dot: "#2C4A3E", bg: "transparent", label: t("kanji.verdicts.halal"),   lc: "#1F362D" },
    syubhat: { dot: "#C8923A", bg: "#F4E4BF",     label: t("kanji.verdicts.syubhat"), lc: "#5A4116" },
    haram:   { dot: "#B85C3C", bg: "#F1D5C7",     label: t("kanji.verdicts.haram"),   lc: "#6B2F1D" },
  }[tone];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 12px", borderRadius: 10,
      background: cfg.bg, opacity: tone === "halal" ? 0.85 : 1,
    }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="mono" style={{ fontSize: 11, color: "#6B6A63", marginBottom: 1 }}>{jp}</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{en}</div>
      </div>
      <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: cfg.lc, textTransform: "uppercase" }}>
        {cfg.label}
      </div>
    </div>
  );
}

function VerdictCard({ verdict, resultHtml, onReset }: { verdict: Status; resultHtml: string; onReset: () => void }) {
  const cfg = {
    halal:   { bg: "#DFE8DA", fg: "#2C4A3E",  strong: "#1F362D", label: t("cekHalal.verdict.halal"),    sub: t("cekHalal.verdict.halalSub"),
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    syubhat: { bg: "#F4E4BF", fg: "#7A5A1F",  strong: "#5A4116", label: t("cekHalal.verdict.syubhat"),  sub: t("cekHalal.verdict.syubhatSub"),
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M12 4v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/><circle cx="12" cy="18" r="1.5" fill="#fff"/></svg> },
    haram:   { bg: "#F1D5C7", fg: "#93462C",  strong: "#6B2F1D", label: t("cekHalal.verdict.haram"),    sub: t("cekHalal.verdict.haramSub"),
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/></svg> },
    idle:    { bg: "#EFEBE2", fg: "#6B6A63",  strong: "#3D3D3A", label: "",         sub: "", icon: null },
  }[verdict];

  if (verdict === "idle") return null;

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Verdict badge */}
      <div style={{
        background: cfg.bg, border: `0.5px solid ${cfg.fg}22`,
        borderRadius: 18, padding: 22,
        boxShadow: "0 1px 0 rgba(43,32,15,.05), 0 8px 24px -10px rgba(43,32,15,.14)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: cfg.strong,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 8px 18px -8px rgba(0,0,0,0.25)",
          }}>{cfg.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: cfg.fg, opacity: 0.7, marginBottom: 4 }}>
              {t("cekHalal.verdict.label")}
            </div>
            <div className="serif" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, color: cfg.strong, letterSpacing: -0.6 }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: 12.5, color: cfg.fg, marginTop: 4 }}>{cfg.sub}</div>
          </div>
        </div>
      </div>

      {/* AI content */}
      <div style={{
        background: "#fff", border: "0.5px solid #E8E3D6",
        borderRadius: 18, padding: "20px 20px 20px",
        boxShadow: "var(--shadow-card)",
      }}>
        <div
          className="ai-content"
          dangerouslySetInnerHTML={{ __html: resultHtml }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onReset}
          className="tap"
          style={{
            flex: 1, height: 52, border: "1px solid #D8D2C4",
            background: "#fff", color: "#3D3D3A",
            borderRadius: 14, fontWeight: 600, fontSize: 15,
            cursor: "pointer",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {t("cekHalal.verdict.scanAgain")}
        </button>
      </div>

      <div className="mono" style={{ fontSize: 11, color: "#9B998F", textAlign: "center", lineHeight: 1.5 }}>
        {t("cekHalal.verdict.disclaimer")}
      </div>
    </div>
  );
}

export default function CekHalal({ isActive, onShowPaywall }: { isActive: boolean; onShowPaywall?: () => void }) {
  const [images, setImages]             = useState<ImageItem[]>([]);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [resultHtml, setResultHtml]     = useState<string | null>(null);
  const [status, setStatus]             = useState<Status>("idle");
  const [error, setError]               = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode]     = useState<"general" | "barcode">("general");
  const [activeSource, setActiveSource] = useState<"camera" | "barcode" | "gallery" | null>(null);
  const [kamusOpen, setKamusOpen]       = useState(false);

  const streamRef       = useRef<MediaStream | null>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOpen(false);
  };

  useEffect(() => { if (!isActive) stopCamera(); }, [isActive]);
  useEffect(() => () => stopCamera(), []);

  const startCamera = async (mode: "general" | "barcode") => {
    setError(null); setCameraMode(mode); setActiveSource(mode === "general" ? "camera" : "barcode");
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setError(t("cekHalal.camera.errorCamera"));
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const capturePhoto = () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    const maxW = 800;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setImages((prev) => [...prev, { dataUrl, base64Data: dataUrl.split(",")[1], mimeType: "image/jpeg" }]);
    stopCamera();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setActiveSource("gallery");
    const newImages = await Promise.all(files.map(async (file) => {
      const reader = new FileReader();
      const original = await new Promise<string>((res, rej) => {
        reader.onload = (ev) => res(ev.target!.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(original);
      return { dataUrl: compressed, base64Data: compressed.split(",")[1], mimeType: "image/jpeg" };
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const reset = () => {
    setImages([]); setResultHtml(null); setStatus("idle");
    setError(null); setActiveSource(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    stopCamera();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const analyze = async () => {
    if (!images.length) return;
    setIsAnalyzing(true); setResultHtml(null); setError(null); setStatus("idle");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map(({ base64Data, mimeType }) => ({ base64Data, mimeType })), locale: getLocale() }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        onShowPaywall?.();
        return;
      }
      if (!res.ok) throw new Error(t("common.errorGeneral"));
      const { status: parsed, cleaned } = parseStatus(data.result);
      setStatus(parsed);
      setResultHtml(DOMPurify.sanitize(cleaned));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("cekHalal.camera.errorProcess"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Camera overlay ──
  if (isCameraOpen) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 80 }} className="animate-fade-in">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 60%, #2a2620 0%, #0c0a07 70%)",
        }} />

        {/* viewfinder */}
        <div style={{
          position: "absolute", left: 32, right: 32, top: "18%", bottom: "30%",
          pointerEvents: "none",
        }}>
          {(["tl","tr","bl","br"] as const).map((c) => (
            <div key={c} style={{
              position: "absolute", width: 30, height: 30,
              borderTop:    c[0] === "t" ? "3px solid #fff" : "none",
              borderBottom: c[0] === "b" ? "3px solid #fff" : "none",
              borderLeft:   c[1] === "l" ? "3px solid #fff" : "none",
              borderRight:  c[1] === "r" ? "3px solid #fff" : "none",
              borderTopLeftRadius:     c === "tl" ? 8 : 0,
              borderTopRightRadius:    c === "tr" ? 8 : 0,
              borderBottomLeftRadius:  c === "bl" ? 8 : 0,
              borderBottomRightRadius: c === "br" ? 8 : 0,
              top:    c[0] === "t" ? -1 : undefined,
              bottom: c[0] === "b" ? -1 : undefined,
              left:   c[1] === "l" ? -1 : undefined,
              right:  c[1] === "r" ? -1 : undefined,
            }} />
          ))}
          <div style={{
            position: "absolute", left: 12, right: 12, height: 2,
            background: "linear-gradient(90deg, transparent, #7DD3A8 50%, transparent)",
            boxShadow: "0 0 14px #7DD3A8",
          }} className="animate-scanline" />
        </div>

        <div style={{
          position: "absolute", top: "12%", left: 0, right: 0, textAlign: "center",
          color: "#fff", fontSize: 14, fontWeight: 500,
          textShadow: "0 1px 8px rgba(0,0,0,0.6)",
        }}>
          {cameraMode === "barcode" ? t("cekHalal.camera.barcodeHint") : t("cekHalal.camera.generalHint")}
        </div>

        <video ref={videoRef} autoPlay playsInline muted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />

        <div style={{
          position: "absolute", bottom: 64, left: 0, right: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 32px",
        }}>
          <button onClick={stopCamera} className="tap" style={{
            color: "#fff", background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255,255,255,0.25)",
            padding: "10px 16px", borderRadius: 999, fontWeight: 600, fontSize: 13,
            cursor: "pointer",
          }}>{t("cekHalal.camera.cancelBtn")}</button>
          <button onClick={capturePhoto} className="tap" style={{
            width: 70, height: 70, borderRadius: "50%",
            background: "#fff", border: "4px solid rgba(255,255,255,0.4)",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.15)",
            padding: 0, cursor: "pointer",
          }} aria-label={t("cekHalal.camera.captureLabel")} />
          <div style={{ width: 60 }} />
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100dvh", paddingBottom: 96,
      overflowY: "auto", overflowX: "hidden",
    }}>
      {/* Screen header */}
      <div style={{ padding: "72px 22px 18px" }}>
        <h1 className="serif" style={{
          fontSize: 30, fontWeight: 500, letterSpacing: -0.6,
          margin: "0 0 8px", color: "#1B1B19", lineHeight: 1.05,
        }}>{t("cekHalal.title")}</h1>
        <p style={{ margin: 0, color: "#6B6A63", fontSize: 13.5, lineHeight: 1.45 }}>
          {t("cekHalal.subtitle")}
        </p>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Scan sources */}
        <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelect} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <ScanSource label={t("cekHalal.scan.camera")} sub={t("cekHalal.scan.cameraHint")} icon={<IconCamera />} onClick={() => startCamera("general")} active={activeSource === "camera"} />
          <ScanSource label={t("cekHalal.scan.barcode")} sub={t("cekHalal.scan.barcodeHint")} icon={<IconBarcode />} onClick={() => startCamera("barcode")} active={activeSource === "barcode"} />
          <ScanSource label={t("cekHalal.scan.gallery")} sub={t("cekHalal.scan.galleryHint")} icon={<IconGallery />} onClick={() => galleryInputRef.current?.click()} active={activeSource === "gallery"} />
        </div>

        {/* Onboarding */}
        {images.length === 0 && !resultHtml && !isAnalyzing && (
          <div style={{
            background: "#fff", border: "0.5px solid #E8E3D6",
            borderRadius: 18, padding: 18,
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: "#6B6A63", marginBottom: 10 }}>
              {t("cekHalal.onboarding.howTo")}
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [t("cekHalal.onboarding.step1Title"), t("cekHalal.onboarding.step1Desc")],
                [t("cekHalal.onboarding.step2Title"), t("cekHalal.onboarding.step2Desc")],
                [t("cekHalal.onboarding.step3Title"), t("cekHalal.onboarding.step3Desc")],
              ].map(([t, d], i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className="mono" style={{
                    width: 22, height: 22, borderRadius: 7,
                    background: "#2C4A3E", color: "#fff",
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div>
                    <div style={{ fontSize: 12.5, color: "#6B6A63", marginTop: 1, lineHeight: 1.4 }}>{d}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div style={{
              marginTop: 16, padding: 12, borderRadius: 12, background: "#EFEBE2",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
              <p style={{ margin: 0, fontSize: 11.5, color: "#6B6A63", lineHeight: 1.5 }}>
                {t("cekHalal.onboarding.disclaimer")}
              </p>
            </div>

            {/* Kamus Kanji entry point */}
            <button
              onClick={() => setKamusOpen(true)}
              className="tap"
              style={{
                marginTop: 14, width: "100%",
                background: "#D8E2DA",
                border: "0.5px solid rgba(44,74,62,0.18)",
                borderRadius: 14, padding: "14px 14px",
                display: "flex", alignItems: "center", gap: 12,
                textAlign: "left", cursor: "pointer",
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span className="serif" style={{ fontSize: 22, fontWeight: 600, color: "#2C4A3E", lineHeight: 1 }}>豚</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1F362D" }}>{t("cekHalal.onboarding.kamusTitle")}</div>
                <div style={{ fontSize: 11.5, color: "#6B6A63", marginTop: 1, lineHeight: 1.4 }}>
                  {t("cekHalal.onboarding.kamusDesc")}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#1F362D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Kamus overlay */}
        {kamusOpen && <KamusKanji onClose={() => setKamusOpen(false)} />}

        {/* Image previews */}
        {images.length > 0 && !isAnalyzing && !resultHtml && (
          <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "#fff", border: "0.5px solid #E8E3D6",
              borderRadius: 18, padding: 14,
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t("cekHalal.preview.readyLabel")}</div>
                <span className="mono" style={{ fontSize: 11, color: "#6B6A63" }}>{images.length} {t("cekHalal.preview.photoCount")}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: "0.5px solid #E8E3D6" }}>
                    <img src={img.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        width: 20, height: 20, borderRadius: 10,
                        background: "rgba(0,0,0,0.5)", border: "none",
                        color: "#fff", fontSize: 12, padding: 0, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={analyze}
              className="tap"
              style={{
                height: 60, width: "100%",
                background: "#2C4A3E", color: "#fff",
                border: "none", borderRadius: 14,
                fontSize: 16, fontWeight: 600, letterSpacing: 0.1,
                cursor: "pointer",
                boxShadow: "0 8px 18px -8px rgba(44,74,62,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {t("cekHalal.preview.analyzeBtn")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={reset} className="tap" style={{ border: "none", background: "transparent", color: "#6B6A63", fontSize: 13, fontWeight: 500, padding: 8, cursor: "pointer" }}>
              {t("cekHalal.preview.retakeBtn")}
            </button>
          </div>
        )}

        {/* Analyzing */}
        {isAnalyzing && (
          <div className="animate-fade-in" style={{
            background: "#fff", border: "0.5px solid #E8E3D6",
            borderRadius: 18, padding: 22,
            boxShadow: "var(--shadow-card)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "#2C4A3E", opacity: 0.15,
              }} className="animate-pulse-ring" />
              <div style={{
                position: "absolute", inset: 12, borderRadius: "50%",
                background: "#2C4A3E",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" style={{ animation: "spin .9s linear infinite" }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2.4"/>
                  <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="serif" style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>{t("cekHalal.analyzing.title")}</div>
              <div style={{ fontSize: 12.5, color: "#6B6A63", marginTop: 4 }}>{t("cekHalal.analyzing.subtitle")}</div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              {[t("cekHalal.analyzing.step1"), t("cekHalal.analyzing.step2"), t("cekHalal.analyzing.step3")].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#6B6A63" }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: i < 2 ? "#2C4A3E" : "transparent",
                    border: i < 2 ? "none" : "1.5px dashed #9B998F",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {i < 2 && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l1.8 1.8L7 1.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "14px 16px", background: "#F1D5C7",
            border: "0.5px solid rgba(147,70,44,0.22)",
            borderRadius: 14, display: "flex", gap: 10, alignItems: "flex-start",
          }} className="animate-fade-in">
            <span style={{ fontSize: 16 }}>⚠</span>
            <p style={{ margin: 0, fontSize: 13, color: "#6B2F1D", lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Verdict */}
        {resultHtml && status !== "idle" && (
          <VerdictCard verdict={status} resultHtml={resultHtml} onReset={reset} />
        )}
      </div>
    </div>
  );
}
