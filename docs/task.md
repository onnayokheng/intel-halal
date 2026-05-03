# Intel Halal — Task List

> Update checklist ini setiap task selesai.
> Format: `- [x]` untuk selesai, `- [ ]` untuk belum.

---

## Fase 1 — Frontend

### Setup Project
- [ ] Init Next.js 15 (TypeScript, App Router, Tailwind)
- [ ] Install dependencies (lucide-react, dompurify, @types/dompurify)
- [ ] Konfigurasi Tailwind dengan Agentic design tokens
- [ ] Setup font Playfair Display + JetBrains Mono (next/font/google)
- [ ] Buat `globals.css` dengan CSS variables Agentic
- [ ] Buat `.env.local` template + `.gitignore`

### Layout & Navigation
- [ ] Buat `app/layout.tsx` (font, metadata, mobile viewport)
- [ ] Buat `components/bottom-nav.tsx` (4 tab: Cek Halal, Bea Impor, Trip Plan, Find Place)
- [ ] Buat `app/page.tsx` (tab controller, keep-alive pattern)

### API Routes (server-side proxy)
- [ ] Buat `app/api/analyze/route.ts` (proxy Gemini untuk Cek Halal)
- [ ] Buat `app/api/trip/route.ts` (proxy Gemini untuk Trip Plan)

### Komponen Fitur
- [ ] Buat `components/cek-halal.tsx` (redesign dengan Agentic style)
- [ ] Buat `components/bea-impor.tsx` (redesign dengan Agentic style)
- [ ] Buat `components/trip-plan.tsx` (redesign dengan Agentic style)
- [ ] Buat `components/find-place.tsx` (redesign dengan Agentic style)

### QA Fase 1
- [ ] Test Cek Halal end-to-end (kamera, galeri, barcode)
- [ ] Test Bea Impor (kalkulasi + kurs realtime)
- [ ] Test Trip Plan (input → hasil AI)
- [ ] Test Find Place (deteksi lokasi + buka Google Maps)
- [ ] Cek mobile view di browser (max-w-[430px])
- [ ] Verifikasi API key tidak expose di client (DevTools → Network)

---

## Fase 2 — Backend & Cache

- [ ] Setup Neon Postgres (`labs_intelhalal`) via Vercel
- [ ] Install drizzle-orm / prisma + neon driver
- [ ] Buat schema tabel `product_cache`
- [ ] Migrasi schema ke Neon
- [ ] Update `api/analyze/route.ts`: cek cache sebelum hit Gemini
- [ ] Implementasi cache write setelah hasil AI diterima
- [ ] Implementasi 90-day expiry (auto-expire via `expires_at`)
- [ ] Test cache hit (barcode yang sama → tidak hit Gemini)
- [ ] Test cache miss (produk baru → hit Gemini → simpan)

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
