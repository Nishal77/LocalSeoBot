import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = { businessId: business.id, ...(status ? { status } : {}) };
  const [posts, total] = await Promise.all([
    prisma.gbpPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gbpPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const job = await queues.gbpPostGenerate.add("gbp.post.generate", { businessId: business.id });
  return NextResponse.json({ jobId: job.id, message: "Post generation triggered" });
}
