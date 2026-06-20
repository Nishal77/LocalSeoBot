import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const connectUrl = `/api/onboarding/gbp/connect?businessId=${business.id}&reconnect=true`;
  return NextResponse.json({ url: connectUrl });
}
