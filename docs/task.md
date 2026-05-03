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
