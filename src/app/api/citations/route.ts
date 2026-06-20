import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;

  const where = { businessId: business.id, ...(status ? { status } : {}) };
  const [citations, total] = await Promise.all([
    prisma.citation.findMany({
      where,
      include: { directory: true },
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.citation.count({ where }),
  ]);

  return NextResponse.json({ citations, total, page, pages: Math.ceil(total / limit) });
}
