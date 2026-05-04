import { compressImage } from "@/lib/utils";

// ── Trip Plan history ─────────────────────────────────────────
const TRIP_KEY = "intel-halal-trip-history";

export interface TripHistoryItem {
  id: string;
  timestamp: number;
  origin: string;
  destination: string;
  resultHtml: string;
}

export function getTripHistory(): TripHistoryItem[] {
  try { return JSON.parse(localStorage.getItem(TRIP_KEY) ?? "[]"); } catch { return []; }
}

export function saveTripHistory(params: { origin: string; destination: string; resultHtml: string }): void {
  const item: TripHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    ...params,
  };
  const updated = [item, ...getTripHistory()].slice(0, MAX_ITEMS);
  localStorage.setItem(TRIP_KEY, JSON.stringify(updated));
}

export function deleteTripHistoryItem(id: string): TripHistoryItem[] {
  const updated = getTripHistory().filter((h) => h.id !== id);
  localStorage.setItem(TRIP_KEY, JSON.stringify(updated));
  return updated;
}

export function clearTripHistory(): void {
  localStorage.removeItem(TRIP_KEY);
}

const STORAGE_KEY = "intel-halal-scan-history";
const MAX_ITEMS = 30;

export interface HistoryItem {
  id: string;
  timestamp: number;
  status: "halal" | "syubhat" | "haram";
  title: string;
  resultHtml: string;
  thumbnail: string;
}

function extractTitle(html: string): string {
  const m = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  if (m) return m[1].replace(/<[^>]+>/g, "").trim().slice(0, 60);
  const m2 = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
  if (m2) return m2[1].replace(/<[^>]+>/g, "").trim().slice(0, 60);
  return "";
}

export function getHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export async function saveToHistory(params: {
  status: "halal" | "syubhat" | "haram";
  resultHtml: string;
  thumbnailDataUrl: string;
}): Promise<void> {
  const title = extractTitle(params.resultHtml);
  let thumbnail = "";
  if (params.thumbnailDataUrl) {
    try {
      thumbnail = await compressImage(params.thumbnailDataUrl, 80);
    } catch {
      thumbnail = "";
    }
  }

  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    status: params.status,
    title,
    resultHtml: params.resultHtml,
    thumbnail,
  };

  const existing = getHistory();
  const updated = [item, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const updated = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
