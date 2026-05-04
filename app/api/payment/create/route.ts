import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { PLANS, type Plan } from "@/lib/access";
import { createQrisPayment } from "@/lib/amsholpay";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: Plan };
  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planInfo = PLANS[plan];

  // Idempotency: cegah double-submission (race condition)
  const [existing] = await db.select().from(subscription)
    .where(and(eq(subscription.userId, session.user.id), eq(subscription.status, "pending")))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "Ada transaksi pending, selesaikan dulu." }, { status: 409 });
  }

  // Simpan subscription pending dulu
  const [sub] = await db.insert(subscription).values({
    userId:    session.user.id,
    plan,
    amountIdr: planInfo.priceIdr,
    status:    "pending",
  }).returning();

  // Generate QRIS via AmsholPay
  let payment;
  try {
    payment = await createQrisPayment({
      trxId:        sub.id,
      customerName: session.user.name,
      customerEmail: session.user.email,
      amount:       planInfo.priceIdr,
      description:  `Intel Halal Premium - ${planInfo.label}`,
    });
  } catch (err) {
    // Rollback subscription record
    await db.delete(subscription).where(eq(subscription.id, sub.id));
    const msg = err instanceof Error ? err.message : "Payment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!payment.status) {
    await db.delete(subscription).where(eq(subscription.id, sub.id));
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }

  // Simpan reference dari AmsholPay
  await db.update(subscription)
    .set({ paymentRef: payment.data.reference })
    .where(eq(subscription.id, sub.id));

  return NextResponse.json({
    subscriptionId: sub.id,
    qrString:       payment.data.qr_string,
    payUrl:         payment.data.pay_url,
    amount:         payment.data.amount,
    reference:      payment.data.reference,
    instructions:   payment.data.instructions,
  });
}
