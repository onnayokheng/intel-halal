# Intel Halal — Task List

> Update checklist ini setiap task selesai.
> Format: `- [x]` untuk selesai, `- [ ]` untuk belum.

---

## Fase 1 — Frontend

### Setup Project
- [x] Init Next.js (TypeScript, App Router, Tailwind)
- [x] Install dependencies (lucide-react, dompurify)
- [x] Konfigurasi design tokens (earthy palette — paper, forest, terracotta, amber)
- [x] Setup font Fraunces + Plus Jakarta Sans + JetBrains Mono
- [x] Buat `globals.css` dengan CSS variables + AI prose styles
- [x] Buat `.env.local` template + `.gitignore`

### Layout & Navigation
- [x] Buat `app/layout.tsx` (font, metadata, mobile viewport)
- [x] Buat `components/brand-bar.tsx` (logo "ih" + wordmark, fixed top)
- [x] Buat `components/bottom-nav.tsx` (floating frosted-glass pill, 5 tab)
- [x] Buat `app/page.tsx` (tab controller, keep-alive pattern)

### API Routes (server-side proxy)
- [x] Buat `app/api/analyze/route.ts` (proxy Gemini untuk Cek Halal + access gate)
- [x] Buat `app/api/trip/route.ts` (proxy Gemini untuk Trip Plan + access gate)

### Komponen Fitur
- [x] Buat `components/cek-halal.tsx` (earthy design, verdict cards, camera overlay, history)
- [x] Buat `components/bea-impor.tsx` (pure rule-based, tanpa AI)
- [x] Buat `components/trip-plan.tsx` (story-telling route, AI via proxy, history)
- [x] Buat `components/find-place.tsx` (2-col category grid, sub-category pills, tanpa AI)

### Design
- [x] Implementasi Claude Design (earthy palette dari design file)
- [x] Rapihkan 3 kolom scan source (Kamera / Barcode / Galeri) — equal height
- [x] Rapihkan AI result prose (bullet dots, spacing, h4 label, padding)
- [x] Brand bar: fixed position + top spacing
- [x] App icon "ih" rounded square (favicon + apple-icon via ImageResponse)

### QA Fase 1
- [x] Test Cek Halal end-to-end (kamera, galeri, barcode)
- [x] Test Bea Impor (kalkulasi + kurs realtime)
- [x] Test Trip Plan API — response AI OK
- [x] Test Analyze API — status tag + HTML response OK
- [x] Test Find Place (deteksi lokasi + buka Google Maps)
- [x] Cek mobile view di browser (max-w-[430px])
- [x] Verifikasi API key tidak expose di client (server-side only via API route)

### Git & Deployment
- [x] Buat repo GitHub (https://github.com/onnayokheng/intel-halal)
- [x] Initial commit + push ke main
- [x] Deploy ke Vercel (https://intelhalal.vercel.app)

---

## Fase 2 — Backend & Cache

- [x] Setup Neon Postgres (`labs_intelhalal`) via Vercel
- [x] Install drizzle-orm + @neondatabase/serverless + drizzle-kit
- [x] Buat schema tabel `product_cache`
- [x] Push schema ke Neon (`pnpm db:push`)
- [x] Update `api/analyze/route.ts`: cek cache sebelum hit Gemini (try/catch aman)
- [x] Implementasi cache write setelah hasil AI diterima
- [x] Implementasi 90-day expiry (auto-expire via `expires_at`)
- [x] Tambah `DATABASE_URL` + `DATABASE_URL_UNPOOLED` di Vercel environment variables
- [x] Test cache miss/hit di production ✓

---

## Fitur Tambahan (v2)

### Jadwal Sholat
- [x] Komponen `prayer.tsx` — location strip, next prayer hero, prayer list, settings sheet
- [x] Integrasi Aladhan API: prayer times real
- [x] GPS auto-detect + reverse geocode (Nominatim)
- [x] Real-time countdown (update 1 detik, tampilkan detik hanya jika < 1 jam)
- [x] Default metode hisab: Muslim World League

### Kamus Kanji Halal
- [x] Komponen `kanji.tsx` sebagai modal overlay
- [x] 8 kategori, 18 entri kanji dengan verdict
- [x] Search + filter chips + detail view dengan related kanji navigation

### Bottom Nav v2
- [x] 5 tab dengan center FAB (Cek Halal jadi terracotta button menonjol)
- [x] Default tab: Cek Halal

### i18n (Internasionalisasi)
- [x] Ekstrak semua string UI ke `locales/id.json` + `locales/en.json`
- [x] Utility `t()`, `ta()`, `tObj()` di `lib/i18n.ts`
- [x] Language toggle (ID/EN) di BrandBar
- [x] Persistent locale di localStorage + fix bug refresh
- [x] AI responses (Cek Halal & Trip Plan) mengikuti bahasa yang dipilih

### Onboarding
- [x] 3-screen onboarding (Welcome / Fitur / Login)
- [x] Animasi slide-in antar screen
- [x] Skip → langsung ke screen login
- [x] Flag `onboarding_done` di localStorage (hanya tampil sekali)

### History
- [x] Cek Halal: auto-save ke localStorage, overlay list + detail (thumbnail + status)
- [x] Trip Plan: auto-save ke localStorage, overlay list + detail (origin→destination)

---

## Fase 3 — Auth & Membership ✅

- [x] Install better-auth
- [x] Setup tabel `user`, `session`, `account`, `verification`
- [x] Google OAuth (better-auth + Google Cloud Console)
- [x] Route protection: access gate di `/api/analyze` + `/api/trip`
- [x] User avatar + logout di brand-bar (bottom sheet)
- [x] DEV_SKIP_AUTH flag untuk bypass auth di local dev

### Freemium
- [x] Trial 12 jam otomatis saat signup (via `databaseHooks`)
- [x] Tabel `subscription` (plan: 7day/30day, status: pending→active→expired)
- [x] `checkAccess()` + `getAccessInfo()` di `lib/access.ts`
- [x] Trial countdown pill di brand-bar (kuning → merah saat habis)
- [x] Badge "Premium" di brand-bar saat subscription aktif
- [x] Info expiry (jam + tanggal) di user popup
- [x] Paywall modal (bottom sheet, 2 plan card, harga coret)

---

## Fase 4 — Payment ✅

- [x] Integrasi AmsholPay QRIS (bukan Midtrans)
- [x] `lib/amsholpay.ts`: createQrisPayment + verifyCallbackSignature (timing-safe)
- [x] `api/payment/create`: generate transaksi, idempotency check
- [x] `api/payment/callback/amsholpay`: webhook aktivasi subscription + handle expired/cancel
- [x] `api/payment/status`: polling status oleh client (5 detik)
- [x] `api/payment/cancel`: batalkan pending subscription (IDOR-safe)
- [x] Payment sheet: QR code QRIS + loading + sukses screen + "Batalkan Transaksi"
- [x] Test payment di production ✓

---

## Security Audit ✅

- [x] DEV_SKIP_AUTH: tambah NODE_ENV=production guard
- [x] HMAC callback: ganti `===` dengan `crypto.timingSafeEqual`
- [x] Callback: validasi amount sesuai subscription sebelum aktivasi
- [x] Payment create: idempotency check cegah double-subscription
- [x] QR image: validasi URL sebelum render ke `<img src>`
- [x] Cache SELECT: bungkus try/catch (DB gagal tidak bikin 500)

---

## Pending / Belum Dikerjakan

- [ ] WhatsApp login (tombol disembunyikan, tunggu integrasi)
- [ ] Arah kiblat (di-skip sesuai keputusan)
- [ ] Push notification / reminder sholat
- [ ] Admin dashboard (lihat transaksi, user stats)
- [ ] Production AmsholPay keys (sekarang masih testing)
