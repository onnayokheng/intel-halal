import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriptionId } = await req.json() as { subscriptionId: string };

  // Pastikan subscription milik user ini dan masih pending
  const [sub] = await db.select().from(subscription)
    .where(and(
      eq(subscription.id, subscriptionId),
      eq(subscription.userId, session.user.id),
      eq(subscription.status, "pending"),
    ))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan atau sudah diproses" }, { status: 404 });
  }

  await db.update(subscription)
    .set({ status: "cancelled" })
    .where(eq(subscription.id, subscriptionId));

  return NextResponse.json({ ok: true });
}
