import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyCallbackSignature } from "@/lib/amsholpay";
import { PLANS, type Plan } from "@/lib/access";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verifikasi signature dari AmsholPay
  if (!verifyCallbackSignature(body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { merchant_ref, reference, status, paid_at } = body;

  // Handle expired / cancel → update status di DB
  if (status === "expired" || status === "cancel") {
    await db.update(subscription)
      .set({ status: "cancelled" })
      .where(eq(subscription.id, merchant_ref));
    return NextResponse.json({ ok: true });
  }

  if (status !== "success") {
    return NextResponse.json({ ok: true });
  }

  const [sub] = await db.select().from(subscription)
    .where(eq(subscription.id, merchant_ref))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  // Validasi amount — cegah aktivasi dengan nominal yang salah
  if (sub.amountIdr !== Number(body.amount)) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const planInfo = PLANS[sub.plan as Plan];
  const startsAt = paid_at ? new Date(paid_at) : new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + planInfo.days);

  await db.update(subscription)
    .set({ status: "active", paymentRef: reference, startsAt, expiresAt })
    .where(eq(subscription.id, merchant_ref));

  return NextResponse.json({ ok: true });
}
