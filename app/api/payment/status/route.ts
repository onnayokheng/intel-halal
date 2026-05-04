import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriptionId } = await req.json() as { subscriptionId: string };

  const [sub] = await db.select()
    .from(subscription)
    .where(eq(subscription.id, subscriptionId))
    .limit(1);

  if (!sub || sub.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: sub.status });
}
