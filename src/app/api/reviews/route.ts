import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const stars = searchParams.get("stars");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = {
    businessId: business.id,
    ...(stars ? { starRating: parseInt(stars) } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { reviewDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) });
}
