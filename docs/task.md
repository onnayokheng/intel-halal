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
- [x] Buat `components/brand-bar.tsx` (eight-point star logo + wordmark, fixed top)
- [x] Buat `components/bottom-nav.tsx` (floating frosted-glass pill, 4 tab)
- [x] Buat `app/page.tsx` (tab controller, keep-alive pattern)

### API Routes (server-side proxy)
- [x] Buat `app/api/analyze/route.ts` (proxy Gemini untuk Cek Halal)
- [x] Buat `app/api/trip/route.ts` (proxy Gemini untuk Trip Plan)

### Komponen Fitur
- [x] Buat `components/cek-halal.tsx` (earthy design, verdict cards, camera overlay)
- [x] Buat `components/bea-impor.tsx` (pure rule-based, tanpa AI)
- [x] Buat `components/trip-plan.tsx` (story-telling route, AI via proxy)
- [x] Buat `components/find-place.tsx` (2-col category grid, sub-category pills, tanpa AI)

### Design
- [x] Implementasi Claude Design (earthy palette dari design file)
- [x] Rapihkan 3 kolom scan source (Kamera / Barcode / Galeri) — equal height
- [x] Rapihkan AI result prose (bullet dots, spacing, h4 label, padding)
- [x] Brand bar: fixed position + top spacing

### QA Fase 1
- [x] Test Cek Halal end-to-end (kamera, galeri, barcode)
- [x] Test Bea Impor (kalkulasi + kurs realtime)
- [x] Test Trip Plan API — response AI OK (Shinjuku → Tokyo Tower)
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
- [x] Update `api/analyze/route.ts`: cek cache sebelum hit Gemini
- [x] Implementasi cache write setelah hasil AI diterima
- [x] Implementasi 90-day expiry (auto-expire via `expires_at`)
- [x] Tambah `DATABASE_URL` di Vercel environment variables
- [x] Test cache miss — `fromCache: false` di response production ✓
- [x] Test cache hit — scan produk sama lebih cepat, DB lookup berhasil ✓

---

## Fitur Tambahan (v2)

### Jadwal Sholat & Arah Kiblat
- [x] Komponen `prayer.tsx` — location strip, next prayer hero, prayer list, qibla compass, settings sheet
- [x] States: loading / denied / located / active-prayer
- [x] Set sebagai default tab (home)
- [x] Integrasi Aladhan API: prayer times + qibla degrees real
- [x] GPS auto-detect + reverse geocode (Nominatim)
- [x] Hijri date dinamis dengan bulan Indonesia
- [x] localStorage cache per (tanggal, hisab, lokasi)
- [x] Real-time countdown (update 1 detik)
- [x] Auto-detect active prayer window (30 menit)
- [x] Live compass via DeviceOrientation API (iOS permission flow + Android)
- [x] Distance ke Mekkah (Haversine)
- [x] Cardinal direction Bahasa Indonesia

### Kamus Kanji Halal
- [x] Komponen `kanji.tsx` sebagai modal overlay (bukan tab)
- [x] 8 kategori, 18 entri kanji dengan verdict
- [x] Search + filter chips
- [x] Detail view dengan related kanji navigation
- [x] Akses dari Cek Halal screen

### Bottom Nav v2
- [x] 5 tab dengan center FAB (Cek Halal jadi terracotta button menonjol)
- [x] Default tab: Cek Halal (reverted dari Sholat)

### i18n (Internasionalisasi)
- [x] Ekstrak semua string UI ke `locales/id.json`
- [x] Buat `locales/en.json` terjemahan lengkap
- [x] Utility `t()`, `ta()`, `tObj()` di `lib/i18n.ts`
- [x] Language toggle (ID/EN) di BrandBar
- [x] Persistent locale di localStorage
- [x] Fix bug: toggle sinkron setelah refresh
- [x] Find Place subcategories translatable
- [x] AI responses (Cek Halal & Trip Plan) mengikuti bahasa yang dipilih
- [x] Countdown timer "jam/menit/detik" translatable

---

## Fase 3 — Auth & Membership (plan)

- [ ] Install better-auth
- [ ] Setup tabel `users`, `sessions`
- [ ] Buat halaman `/login` dan `/register`
- [ ] Proteksi route premium
- [ ] Implementasi rate limiting (3 scan/hari untuk free tier)
- [ ] UI indikator kuota (free user)

---

## Fase 4 — Payment (plan)

- [ ] Integrasi Midtrans / Stripe
- [ ] Buat tabel `subscriptions`
- [ ] Webhook handler untuk update status
- [ ] UI halaman pricing / upgrade
- [ ] Test payment flow (sandbox)
