# Intel Halal — Task List

> Update checklist ini setiap task selesai.
> Format: `- [x]` untuk selesai, `- [ ]` untuk belum.

---

## Fase 1 — Frontend ✅

- [x] Init Next.js (TypeScript, App Router, Tailwind v4), setup design tokens earthy palette
- [x] Font: Fraunces + Plus Jakarta Sans + JetBrains Mono
- [x] `globals.css` CSS variables + AI prose styles + animasi
- [x] `app/layout.tsx`, `brand-bar.tsx`, `bottom-nav.tsx`, `page.tsx`
- [x] App icon "ih" rounded square (favicon + apple-icon via ImageResponse)
- [x] `api/analyze/route.ts` + `api/trip/route.ts` (server-side Gemini proxy)
- [x] Semua komponen fitur: cek-halal, bea-impor, trip-plan, find-place
- [x] Deploy ke Vercel (https://intelhalal.vercel.app)

---

## Fase 2 — Backend & Cache ✅

- [x] Neon Postgres + Drizzle ORM, schema `product_cache`
- [x] Cache lookup (try/catch aman) + write + 90-day expiry
- [x] `DATABASE_URL_UNPOOLED` untuk neon HTTP API (non-pooler endpoint)

---

## Fitur Tambahan v2 ✅

- [x] Jadwal Sholat (Aladhan API + GPS + countdown detik, default Muslim World League)
- [x] Kamus Kanji Halal (modal overlay, 18 entri, 8 kategori)
- [x] Bottom nav 5 tab + center FAB
- [x] i18n ID/EN lengkap (t(), ta(), tObj()), language toggle, persistent locale
- [x] Onboarding 3 screen (Welcome / Fitur / Login), skip → screen login, animasi slide-in

---

## Fase 3 — Auth & Membership ✅

- [x] better-auth + Google OAuth
- [x] Tabel auth: user, session, account, verification
- [x] Access gate di `/api/analyze` + `/api/trip` (401/403 → paywall)
- [x] DEV_SKIP_AUTH flag + NODE_ENV production guard
- [x] User avatar + logout (bottom sheet)
- [x] Trial 12 jam otomatis saat signup
- [x] Trial countdown pill (kuning → merah expired)
- [x] Badge "Premium" saat subscription aktif
- [x] Info expiry (jam + tanggal) di user popup
- [x] Paywall modal: 2 plan, harga coret, QRIS payment

---

## Fase 4 — Payment ✅

- [x] AmsholPay QRIS integration
- [x] `lib/amsholpay.ts`: createQrisPayment + timingSafeEqual HMAC
- [x] `api/payment/create`: generate + idempotency check
- [x] `api/payment/callback/amsholpay`: aktivasi + handle expired/cancel
- [x] `api/payment/status`: polling (5 detik)
- [x] `api/payment/cancel`: batalkan pending (IDOR-safe)
- [x] Payment sheet: QR + sukses screen (nama plan + expiry date)
- [x] Riwayat pembayaran di user popup (+ tombol batalkan untuk pending)
- [x] Test payment di production ✓

---

## Security Audit ✅

- [x] DEV_SKIP_AUTH: NODE_ENV=production guard
- [x] HMAC: crypto.timingSafeEqual
- [x] Callback: validasi amount sebelum aktivasi
- [x] Payment create: idempotency check
- [x] QR image: validasi URL sebelum render
- [x] Cache SELECT: try/catch (DB gagal tidak bikin 500)
- [x] Gemini overload: 503 + pesan "AI sedang sibuk" ke user

---

## UX / History ✅

- [x] Cek Halal history (localStorage, max 30 item, thumbnail + status + relative time)
- [x] Trip Plan history (localStorage, max 30 item, origin→destination)

---

## Pending

- [ ] WhatsApp login (tombol hidden, tunggu integrasi)
- [ ] Production AmsholPay keys (sekarang masih testing)
- [ ] Push notification / reminder sholat
- [ ] Admin dashboard (transaksi, user stats)
- [ ] Arah kiblat (di-skip)
