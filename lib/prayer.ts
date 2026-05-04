/* Aladhan API + prayer time utilities */

import { ta, tObj } from "@/lib/i18n";

export const HISAB_METHOD_ID: Record<string, number> = {
  kemenag: 20,   // Indonesian Ministry of Religious Affairs
  mwl: 3,        // Muslim World League
  egyptian: 5,   // Egyptian General Authority
};

export const HIJRI_MONTHS_ID = ta("sholat.hijriMonths");
export const PRAYER_LABELS_ID = tObj("sholat.prayers");
export const PRAYER_ARABIC    = tObj("sholat.arabic");

export const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerKey = typeof PRAYER_ORDER[number];

export interface PrayerData {
  timings: Record<PrayerKey, string>;       // "HH:MM"
  hijriDay: string;
  hijriMonth: number;
  hijriYear: string;
  gregorianDate: string;                     // "4 Mei 2026"
  fetchedAt: string;                         // ISO date for cache validity
}

export interface PrayerComputed {
  id: string; label: string; arabic: string;
  time: string; date: Date;
}

const cleanTime = (t: string) => t.split(" ")[0];

export const fetchPrayerTimes = async (
  lat: number, lng: number, hisab: string, date: Date
): Promise<PrayerData> => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const m = HISAB_METHOD_ID[hisab] ?? 20;

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}` +
    `?latitude=${lat}&longitude=${lng}&method=${m}`
  );
  if (!res.ok) throw new Error("Gagal mengambil waktu sholat");
  const json = await res.json();
  const data = json.data;

  return {
    timings: {
      Fajr:    cleanTime(data.timings.Fajr),
      Dhuhr:   cleanTime(data.timings.Dhuhr),
      Asr:     cleanTime(data.timings.Asr),
      Maghrib: cleanTime(data.timings.Maghrib),
      Isha:    cleanTime(data.timings.Isha),
    },
    hijriDay:   data.date.hijri.day,
    hijriMonth: data.date.hijri.month.number,
    hijriYear:  data.date.hijri.year,
    gregorianDate: new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    }).format(date),
    fetchedAt: `${yyyy}-${mm}-${dd}`,
  };
};

/** Browser GPS — promise wrapper around navigator.geolocation */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation tidak didukung browser"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  });

/** Reverse geocode to "City, Country" via Nominatim */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { "Accept-Language": "id" } },
    );
    const data = await res.json();
    const city    = data?.address?.city || data?.address?.town || data?.address?.county || "";
    const country = data?.address?.country || "";
    const result = `${city}${city && country ? ", " : ""}${country}`;
    return result || data?.display_name?.split(",").slice(0, 2).join(", ") || "Lokasi terdeteksi";
  } catch {
    return "Lokasi terdeteksi";
  }
};

/** Compute active + next prayer based on current time */
export const findCurrentPrayer = (
  timings: Record<PrayerKey, string>, now: Date,
): { active: PrayerComputed | null; next: PrayerComputed; remainingMs: number } => {
  const prayerDates: PrayerComputed[] = PRAYER_ORDER.map((k) => {
    const [h, m] = timings[k].split(":").map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return {
      id: k.toLowerCase(),
      label: PRAYER_LABELS_ID[k],
      arabic: PRAYER_ARABIC[k],
      time: timings[k],
      date: d,
    };
  });

  const ACTIVE_WINDOW_MS = 30 * 60 * 1000;
  const passed = prayerDates.filter((p) => now >= p.date);
  const lastPassed = passed[passed.length - 1];
  const active = lastPassed && now.getTime() - lastPassed.date.getTime() < ACTIVE_WINDOW_MS
    ? lastPassed : null;

  const upcoming = prayerDates.find((p) => p.date > now);
  let next: PrayerComputed;
  if (upcoming) {
    next = upcoming;
  } else {
    const tomorrow = new Date(prayerDates[0].date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    next = { ...prayerDates[0], label: "Subuh", date: tomorrow };
  }

  return { active, next, remainingMs: next.date.getTime() - now.getTime() };
};

export const formatRemaining = (ms: number): string => {
  if (ms < 0) return "0 detik";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) return `${hours} jam ${mins} menit`;
  if (mins > 0) return `${mins} menit ${secs} detik`;
  return `${secs} detik`;
};

