/* Aladhan API + prayer time utilities */

export const HISAB_METHOD_ID: Record<string, number> = {
  kemenag: 20,   // Indonesian Ministry of Religious Affairs
  mwl: 3,        // Muslim World League
  egyptian: 5,   // Egyptian General Authority
};

export const HIJRI_MONTHS_ID = [
  "", "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

export const PRAYER_LABELS_ID: Record<string, string> = {
  Fajr: "Subuh", Dhuhr: "Dzuhur", Asr: "Ashar", Maghrib: "Maghrib", Isha: "Isya",
};

export const PRAYER_ARABIC: Record<string, string> = {
  Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء",
};

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

export const fetchQibla = async (lat: number, lng: number): Promise<number> => {
  const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
  if (!res.ok) throw new Error("Gagal mengambil arah kiblat");
  const json = await res.json();
  return json.data.direction;
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
  if (ms < 0) return "0 menit";
  const totalMin = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;
};

export const formatActiveRemaining = (
  activeStart: Date, now: Date, windowMin = 30,
): string => {
  const activeEnd = new Date(activeStart.getTime() + windowMin * 60_000);
  const remaining = activeEnd.getTime() - now.getTime();
  if (remaining < 0) return "0 menit";
  const mins = Math.ceil(remaining / 60_000);
  return `${mins} menit`;
};

/** Compass heading utilities — supports iOS webkitCompassHeading + Android alpha */
type CompassEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

export const extractCompassHeading = (e: CompassEvent): number | null => {
  if (e.webkitCompassHeading != null) return e.webkitCompassHeading;
  if (e.alpha != null) return 360 - e.alpha; // Android: alpha is counter-clockwise
  return null;
};

export const compassNeedsPermission = (): boolean => {
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  return typeof DOE?.requestPermission === "function";
};

export const requestCompassPermission = async (): Promise<boolean> => {
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (!DOE?.requestPermission) return true;
  try {
    const result = await DOE.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
};
