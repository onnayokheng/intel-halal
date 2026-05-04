import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const PLANS = {
  "7day":  { label: "7 Hari",  labelEn: "7 Days",  priceIdr: 15000, days: 7  },
  "30day": { label: "1 Bulan", labelEn: "1 Month", priceIdr: 35000, days: 30 },
} as const;

export type Plan = keyof typeof PLANS;

export type AccessStatus =
  | { ok: true;  reason: "trial" | "subscription" }
  | { ok: false; reason: "no-session" | "trial-expired" | "no-subscription" };

export type AccessInfo =
  | { type: "trial";      expiresAt: Date }
  | { type: "premium";    expiresAt: Date; plan: Plan }
  | { type: "expired" }
  | { type: "no-session" };

export async function checkAccess(
  userId: string,
  trialExpiresAt: Date | string | null | undefined,
): Promise<AccessStatus> {
  const now = new Date();

  // Trial masih aktif
  if (trialExpiresAt && new Date(trialExpiresAt) > now) {
    return { ok: true, reason: "trial" };
  }

  // Cek subscription aktif
  const [sub] = await db
    .select()
    .from(subscription)
    .where(and(
      eq(subscription.userId, userId),
      eq(subscription.status, "active"),
      gt(subscription.expiresAt, now),
    ))
    .limit(1);

  if (sub) return { ok: true, reason: "subscription" };

  return { ok: false, reason: "trial-expired" };
}

export async function getAccessInfo(
  userId: string,
  trialExpiresAt: Date | string | null | undefined,
): Promise<AccessInfo> {
  const now = new Date();

  if (trialExpiresAt && new Date(trialExpiresAt) > now) {
    return { type: "trial", expiresAt: new Date(trialExpiresAt) };
  }

  const [sub] = await db
    .select()
    .from(subscription)
    .where(and(
      eq(subscription.userId, userId),
      eq(subscription.status, "active"),
      gt(subscription.expiresAt, now),
    ))
    .limit(1);

  if (sub) return { type: "premium", expiresAt: sub.expiresAt!, plan: sub.plan as Plan };

  return { type: "expired" };
}

/** Berapa milidetik sisa trial. Negatif = sudah habis. */
export function trialMsRemaining(trialExpiresAt: Date | string | null | undefined): number {
  if (!trialExpiresAt) return -1;
  return new Date(trialExpiresAt).getTime() - Date.now();
}
