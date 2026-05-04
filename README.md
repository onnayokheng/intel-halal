# Intel Halal

Asisten pribadi Muslim Indonesia untuk perjalanan ke Jepang — scan produk halal, jadwal sholat, cari tempat, dan rencana perjalanan.

**Live:** https://intelhalal.vercel.app

---

## Fitur

| Fitur | Deskripsi |
|---|---|
| **Cek Halal** | Scan label produk dengan AI (Gemini 2.5 Flash), verdict Halal / Syubhat / Haram |
| **Jadwal Sholat** | Waktu sholat akurat berdasarkan GPS + kompas kiblat |
| **Bea Impor** | Kalkulator bea cukai barang bawaan (rule-based, tanpa AI) |
| **Trip Plan** | Rencana perjalanan AI dengan narasi rute |
| **Find Place** | Cari restoran halal, masjid, toko via Google Maps |
| **Kamus Kanji** | 18 kanji penting untuk baca label makanan Jepang |

## Stack

- **Framework**: Next.js 16 App Router + TypeScript
- **Styling**: Tailwind v4, inline styles (earthy design system)
- **AI**: Gemini 2.5 Flash (server-side proxy)
- **Auth**: better-auth + Google OAuth
- **DB**: Neon Postgres + Drizzle ORM
- **Payment**: AmsholPay (QRIS)
- **Deploy**: Vercel

## Model Bisnis

- **Trial**: 12 jam gratis setelah signup
- **Premium 7 Hari**: Rp 15.000
- **Premium 1 Bulan**: Rp 35.000

## Setup Lokal

```bash
pnpm install
cp .env.example .env.local  # isi env vars
pnpm db:push                # sync schema ke Neon
pnpm dev
```

### Environment Variables

```env
# AI
GEMINI_API_KEY=

# Database
DATABASE_URL=                   # Neon pooler URL
DATABASE_URL_UNPOOLED=          # Neon non-pooler URL (untuk neon HTTP API)

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payment
AMSHOLPAY_API_KEY=
AMSHOLPAY_PRIVATE_KEY=
AMSHOLPAY_MERCHANT_CODE=

# Dev only (jangan set di production)
DEV_SKIP_AUTH=true
NEXT_PUBLIC_DEV_SKIP_AUTH=true
```

## Struktur Penting

```
app/
  api/
    analyze/        — Cek Halal proxy + access gate
    trip/           — Trip Plan proxy + access gate
    auth/[...all]/  — better-auth handler
    payment/        — create, callback, status, cancel
    user/           — access info, payment history
components/
  brand-bar.tsx     — logo, trial pill, avatar, user popup
  cek-halal.tsx     — scanner + history
  trip-plan.tsx     — trip planner + history
  paywall.tsx       — upgrade modal
  payment-sheet.tsx — QR payment flow
lib/
  auth.ts           — better-auth config
  access.ts         — checkAccess, getAccessInfo
  amsholpay.ts      — payment gateway helper
  history.ts        — localStorage scan + trip history
db/
  schema.ts         — product_cache, user, session, subscription, ...
```

## Webhook AmsholPay

Callback URL production:
```
https://intelhalal.vercel.app/api/payment/callback/amsholpay
```

Testing sandbox: https://payment.amalsholeh.com/sandbox
