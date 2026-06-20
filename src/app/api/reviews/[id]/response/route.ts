import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { queues } from "@/lib/queue";

const schema = z.object({ responseText: z.string().min(1).max(1000) });

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { business: { select: { userId: true, id: true } } },
  });

  if (!review || review.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Save edited response then trigger post
  await prisma.review.update({
    where: { id: params.id },
    data: {
      responseText: parsed.data.responseText,
      responseStatus: "approved",
      respondedBy: "user",
    },
  });

  await queues.reviewRespond.add("review.respond", {
    reviewId: review.id,
    businessId: review.business.id,
    approved: true,
  });

  return NextResponse.json({ success: true });
}
