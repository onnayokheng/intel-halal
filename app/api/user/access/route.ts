import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAccessInfo } from "@/lib/access";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ type: "no-session" });
  }

  const info = await getAccessInfo(
    session.user.id,
    (session.user as { trialExpiresAt?: Date }).trialExpiresAt,
  );

  return NextResponse.json(info);
}
