import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function POST(
  _req: Request,
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

  if (review.responseStatus !== "pending_approval") {
    return NextResponse.json({ error: "Review response not pending approval" }, { status: 400 });
  }

  // Trigger the respond job which will post the already-generated response
  await queues.reviewRespond.add("review.respond", {
    reviewId: review.id,
    businessId: review.business.id,
    approved: true,
  });

  await prisma.review.update({
    where: { id: params.id },
    data: { responseStatus: "approved", respondedBy: "user" },
  });

  return NextResponse.json({ success: true });
}
