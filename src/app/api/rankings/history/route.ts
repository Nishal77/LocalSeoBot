import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const keywordId = searchParams.get("keywordId");
  const weeks = parseInt(searchParams.get("weeks") ?? "12");

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const where = keywordId
    ? { keywordId, keyword: { businessId: business.id } }
    : { keyword: { businessId: business.id } };

  const rankings = await prisma.keywordRanking.findMany({
    where: { ...where, checkedAt: { gte: since } },
    include: { keyword: { select: { keyword: true } } },
    orderBy: { checkedAt: "asc" },
  });

  return NextResponse.json({ rankings });
}
