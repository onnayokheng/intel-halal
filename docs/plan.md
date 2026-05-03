# Intel Halal — Project Plan

## Overview
Upgrade aplikasi Intel Halal dari React SPA menjadi Next.js full-stack app dengan UI modern (Agentic design system), cache database untuk efisiensi AI, dan model bisnis freemium.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + Agentic design tokens |
| Font | Playfair Display + JetBrains Mono |
| Icons | lucide-react |
| Database | Neon Postgres (`labs_intelhalal`) via Vercel |
| Auth | better-auth (fase 3) |
| Payment | Midtrans / Stripe (fase 4) |
| Deploy | Vercel |

---

## Design System — Agentic

| Token | Value |
|---|---|
| primary | `#FF5701` |
| secondary | `#F6F6F1` |
| success | `#16A34A` |
| warning | `#D97706` |
| danger | `#DC2626` |
| surface | `#FFFFFF` |
| text | `#111827` |
| Font primary | Playfair Display |
| Font mono | JetBrains Mono |
| Grid | 8pt baseline |
| Touch target | 44px minimum |

**Design constraint**: Mobile-only (max-w-[430px]), WCAG 2.2 AA.

---

## Fase 1 — Frontend (aktif)

Rebuild UI dari `docs/script.js` ke Next.js dengan Agentic design system.
API Gemini dipanggil melalui Next.js API Route (server-side) — key tidak pernah expose ke browser.

### Fitur
1. **Cek Halal** — Scan foto/barcode produk, analisis AI, klasifikasi Halal/Syubhat/Haram
2. **Bea Impor** — Kalkulator pajak IMEI handphone dengan kurs realtime
3. **Trip Plan** — Rencana perjalanan transportasi umum Jepang via AI
4. **Find Place** — Direktori pencarian lokasi terdekat via Google Maps

### Struktur Project
```
intel-halal/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze/route.ts      ← proxy Gemini (Cek Halal)
│       └── trip/route.ts         ← proxy Gemini (Trip Plan)
├── components/
│   ├── cek-halal.tsx
│   ├── bea-impor.tsx
│   ├── trip-plan.tsx
│   ├── find-place.tsx
│   └── bottom-nav.tsx
├── lib/
│   └── utils.ts
├── .env.local
├── next.config.ts
└── tailwind.config.ts
```

---

## Fase 2 — Backend & Cache (setelah fase 1 selesai)

### Database Schema (`labs_intelhalal`)

**`product_cache`**
```sql
id           uuid primary key
lookup_key   text unique not null   -- nama produk (normalized) atau barcode number
result_html  text not null          -- HTML hasil analisis AI
status       text not null          -- 'halal' | 'syubhat' | 'haram'
hit_count    integer default 1
created_at   timestamptz default now()
expires_at   timestamptz            -- created_at + 90 days
```

### Cache Strategy
1. Mode barcode → key = nomor barcode (exact match)
2. Mode gambar → AI call kecil (~100 token) untuk ekstrak nama produk → lookup by nama → kalau miss, full analysis → simpan result

---

## Fase 3 — Auth & Membership (plan, belum implementasi)

- Library: **better-auth**
- Provider: Email/password + Google OAuth
- Tabel tambahan: `users`, `sessions`, `subscriptions`
- Freemium tiers:
  - **Free**: 3 scan/hari, tanpa riwayat
  - **Premium**: Unlimited scan, riwayat 90 hari, semua fitur

---

## Fase 4 — Payment (plan, belum implementasi)

- Gateway: Midtrans (Indonesia) atau Stripe (internasional)
- Integrasi dengan tabel `subscriptions`
- Webhook untuk update status subscription

---

## Catatan Penting
- API key Gemini **tidak boleh** ada di client-side, selalu via API Route
- `dangerouslySetInnerHTML` wajib disanitasi dengan `dompurify` sebelum render
- Semua commit wajib exclude `.env.local`
