"use client";

import { useState } from "react";

const C = {
  bg: "#F7F5F0",
  primary: "#2C4A3E",
  accent: "#B85C3C",
  amber: "#C8923A",
  text: "#1B1B19",
  muted: "#6B6A63",
  card: "#FFFFFF",
  border: "#E8E3D6",
};

function ProgressDots({ active }: { active: number }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: i === active ? 24 : 8,
          height: 8,
          borderRadius: 999,
          background: i <= active ? C.primary : "rgba(44,74,62,0.18)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap" style={{
      width: "100%", height: 56,
      background: C.accent, color: "#fff",
      border: "none", borderRadius: 14,
      fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: 16, letterSpacing: 0.1,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "0 1px 2px rgba(184,92,60,0.2), 0 8px 24px -8px rgba(184,92,60,0.4)",
    }}>
      <span>{children}</span>
      <span style={{ fontSize: 18, marginTop: -1 }}>→</span>
    </button>
  );
}

function SkipLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap" style={{
      background: "transparent", border: "none",
      color: C.muted, fontFamily: "var(--font-jakarta)",
      fontSize: 14, fontWeight: 500, padding: "12px 16px", cursor: "pointer",
    }}>
      Lewati
    </button>
  );
}

// ── Screen 1 ──────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <div style={{ width: "100%", aspectRatio: "1/1", maxWidth: 300, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 8,
        background: "radial-gradient(circle at 30% 30%, #EFE8D6 0%, #E6DCC4 60%, #DACFB4 100%)",
        borderRadius: "50%", opacity: 0.85,
      }} />
      <div style={{ position: "absolute", inset: 0, border: `1px dashed ${C.border}`, borderRadius: "50%", opacity: 0.9 }} />

      {/* Product card */}
      <div style={{
        position: "relative",
        width: 168, height: 210,
        background: "#fff", borderRadius: 14, border: `0.5px solid ${C.border}`,
        boxShadow: "0 12px 32px -12px rgba(27,27,25,0.18), 0 2px 6px rgba(27,27,25,0.04)",
        padding: 14, display: "flex", flexDirection: "column",
        transform: "rotate(-4deg)",
      }}>
        <div style={{
          flex: 1, borderRadius: 8,
          background: "repeating-linear-gradient(135deg, #F2EBDC 0, #F2EBDC 6px, #ECE2CD 6px, #ECE2CD 12px)",
          marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center",
          color: C.muted, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase",
        }}>product</div>
        <div style={{ height: 8, width: "70%", borderRadius: 4, background: "#EFE8D6", marginBottom: 5 }} />
        <div style={{ height: 6, width: "90%", borderRadius: 3, background: "#F2EBDC", marginBottom: 4 }} />
        <div style={{ height: 6, width: "60%", borderRadius: 3, background: "#F2EBDC" }} />
        <div style={{
          position: "absolute", bottom: -10, left: 14,
          background: C.primary, color: "#fff",
          fontFamily: "var(--font-jakarta)", fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          padding: "6px 10px", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 5,
          boxShadow: "0 4px 12px -2px rgba(44,74,62,0.45)",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1.5 5l2.5 2.5L8.5 2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Halal
        </div>
      </div>

      {/* Scan reticle corners */}
      <div style={{ position: "absolute", width: 230, height: 230, transform: "rotate(2deg)", pointerEvents: "none" }}>
        {(["tl","tr","bl","br"] as const).map((pos) => {
          const base: React.CSSProperties = { position: "absolute", width: 26, height: 26 };
          const b = `2px solid ${C.accent}`;
          if (pos === "tl") Object.assign(base, { top: 0, left: 0, borderTop: b, borderLeft: b, borderTopLeftRadius: 6 });
          if (pos === "tr") Object.assign(base, { top: 0, right: 0, borderTop: b, borderRight: b, borderTopRightRadius: 6 });
          if (pos === "bl") Object.assign(base, { bottom: 0, left: 0, borderBottom: b, borderLeft: b, borderBottomLeftRadius: 6 });
          if (pos === "br") Object.assign(base, { bottom: 0, right: 0, borderBottom: b, borderRight: b, borderBottomRightRadius: 6 });
          return <div key={pos} style={base} />;
        })}
      </div>

      {/* Chip: prayer time */}
      <div style={{
        position: "absolute", top: 30, right: 14,
        background: "#fff", borderRadius: 999, padding: "7px 12px 7px 9px",
        display: "flex", alignItems: "center", gap: 7,
        border: `0.5px solid ${C.border}`, boxShadow: "0 8px 20px -8px rgba(27,27,25,0.18)",
        fontFamily: "var(--font-jakarta)", fontSize: 11, fontWeight: 600, color: C.text,
        transform: "rotate(4deg)",
      }}>
        <div style={{ width: 18, height: 18, borderRadius: 999, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2.5" fill="#fff"/></svg>
        </div>
        12:34 Dzuhur
      </div>

      {/* Chip: location */}
      <div style={{
        position: "absolute", bottom: 8, left: -4,
        background: "#fff", borderRadius: 999, padding: "7px 12px 7px 9px",
        display: "flex", alignItems: "center", gap: 7,
        border: `0.5px solid ${C.border}`, boxShadow: "0 8px 20px -8px rgba(27,27,25,0.18)",
        fontFamily: "var(--font-jakarta)", fontSize: 11, fontWeight: 600, color: C.text,
        transform: "rotate(-3deg)",
      }}>
        <div style={{ width: 18, height: 18, borderRadius: 999, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="9" height="11" viewBox="0 0 9 11"><path d="M4.5 0C2 0 0 2 0 4.4 0 7.5 4.5 11 4.5 11S9 7.5 9 4.4C9 2 7 0 4.5 0z" fill="#fff"/></svg>
        </div>
        Shibuya · 0.4km
      </div>
    </div>
  );
}

function Screen1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand mark */}
      <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: C.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 14, fontWeight: 500, fontStyle: "italic",
        }}>ih</div>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>Intel Halal</div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 28px" }}>
        <HeroIllustration />
      </div>

      {/* Headline */}
      <div style={{ padding: "0 28px 24px" }}>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 400, letterSpacing: -0.6, margin: "0 0 14px", color: C.text }}>
          Belanja & Makan di Jepang, <em style={{ fontStyle: "italic", color: C.primary }}>Tanpa&nbsp;Ragu</em>
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, lineHeight: 1.5, color: C.muted, margin: 0 }}>
          Scan label produk, cari tempat halal, dan atur jadwal sholat — semua dalam satu app.
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: "0 24px 48px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <ProgressDots active={0} />
        <PrimaryButton onClick={onNext}>Lanjut</PrimaryButton>
        <SkipLink onClick={onSkip} />
      </div>
    </div>
  );
}

// ── Screen 2 ──────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div style={{
      background: C.card, borderRadius: 20, border: `0.5px solid ${C.border}`,
      padding: "18px 18px 18px 22px", display: "flex", gap: 14, alignItems: "flex-start",
      position: "relative", overflow: "hidden",
      boxShadow: "0 1px 2px rgba(27,27,25,0.03), 0 8px 24px -16px rgba(27,27,25,0.18)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 4, borderRadius: "0 4px 4px 0", background: accent }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.2, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: 13.5, lineHeight: 1.45, color: C.muted }}>{desc}</div>
      </div>
    </div>
  );
}

function Screen2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 28px 0" }}>
        <div className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
          YANG KAMU DAPATKAN
        </div>
        <h1 className="serif" style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 400, letterSpacing: -0.6, margin: 0, color: C.text }}>
          Tiga Fitur <em style={{ fontStyle: "italic", color: C.primary }}>Utama</em>
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, lineHeight: 1.5, color: C.muted, margin: "12px 0 0" }}>
          Tiga alat sederhana untuk menjaga ketenangan selama di Jepang.
        </p>
      </div>

      <div style={{ flex: 1, padding: "28px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <FeatureCard
          accent={C.primary}
          title="Cek Halal"
          desc="Foto label produk, AI langsung analisis status halalnya."
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1.5" y="5.5" width="19" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M7 5.5l1.2-2.2a1 1 0 01.9-.5h3.8a1 1 0 01.9.5L15 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="11" cy="12.5" r="3.6" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
          }
        />
        <FeatureCard
          accent={C.primary}
          title="Cari Tempat"
          desc="Temukan restoran halal, masjid, dan toko terdekat."
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2.5C8 2.5 5.7 4.8 5.7 7.6c0 4 5.3 9.4 5.3 9.4s5.3-5.4 5.3-9.4c0-2.8-2.4-5.1-5.3-5.1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <circle cx="11" cy="7.6" r="2" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M5 18.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
        <FeatureCard
          accent={C.amber}
          title="Jadwal Sholat"
          desc="Waktu sholat akurat berdasarkan lokasimu di Jepang."
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2.5c1.5 1.8 1.5 3.6 0 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M3 19.5V11c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5v8.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M9 19.5V15a2 2 0 014 0v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M3 19.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      <div style={{ padding: "24px 24px 48px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <ProgressDots active={1} />
        <PrimaryButton onClick={onNext}>Lanjut</PrimaryButton>
        <SkipLink onClick={onSkip} />
      </div>
    </div>
  );
}

// ── Screen 3 ──────────────────────────────────────────────────
function AuthButton({ children, bg, color, border, icon, shadow, onClick }: {
  children: React.ReactNode; bg: string; color: string;
  border?: string; icon: React.ReactNode; shadow?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="tap" style={{
      width: "100%", height: 56, background: bg, color,
      border: border || "none", borderRadius: 14,
      fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: 15.5, letterSpacing: 0.1,
      cursor: "pointer", display: "flex", alignItems: "center",
      paddingLeft: 20, paddingRight: 20, gap: 14,
      boxShadow: shadow,
    }}>
      <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ flex: 1, textAlign: "center", paddingRight: 22 }}>{children}</div>
    </button>
  );
}

function Screen3({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo mark */}
      <div style={{ padding: "52px 28px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: C.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-fraunces)", fontStyle: "italic", color: "#fff",
          fontSize: 30, fontWeight: 500,
          boxShadow: "0 18px 40px -16px rgba(44,74,62,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
          marginBottom: 32,
        }}>ih</div>
      </div>

      {/* Headline */}
      <div style={{ padding: "0 28px", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1.6, textTransform: "uppercase", color: C.accent, marginBottom: 14 }}>
          MULAI PERJALANANMU
        </div>
        <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.05, fontWeight: 400, letterSpacing: -0.8, margin: "0 0 14px", color: C.text }}>
          Masuk atau <em style={{ fontStyle: "italic", color: C.primary }}>Daftar</em>
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, lineHeight: 1.5, color: C.muted, margin: 0, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
          Simpan riwayat scan dan akses fitur lengkap.
        </p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Auth buttons */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <AuthButton
          bg="#fff" color={C.text}
          border={`1px solid ${C.border}`}
          shadow="0 1px 2px rgba(27,27,25,0.04), 0 6px 16px -10px rgba(27,27,25,0.18)"
          onClick={onDone}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
        >
          Lanjut dengan Google
        </AuthButton>

        <AuthButton
          bg="#25D366" color="#fff"
          shadow="0 1px 2px rgba(37,211,102,0.2), 0 8px 24px -10px rgba(37,211,102,0.45)"
          onClick={onDone}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          }
        >
          Lanjut dengan WhatsApp
        </AuthButton>
      </div>

      {/* Footer */}
      <div style={{ padding: "28px 36px 48px", display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 11, lineHeight: 1.5, color: C.muted, margin: 0, textAlign: "center" }}>
          Dengan masuk, kamu menyetujui Syarat & Ketentuan kami.
        </p>
        <ProgressDots active={2} />
      </div>
    </div>
  );
}

// ── Main Onboarding component ─────────────────────────────────
export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem("onboarding_done", "1");
    onDone();
  };

  const goToLogin = () => setStep(2);

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 70,
        maxWidth: 430, margin: "0 auto",
        background: C.bg,
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        color: C.text,
      }}
    >
      {step === 0 && <Screen1 onNext={() => setStep(1)} onSkip={goToLogin} />}
      {step === 1 && <Screen2 onNext={() => setStep(2)} onSkip={goToLogin} />}
      {step === 2 && <Screen3 onDone={finish} />}
    </div>
  );
}
