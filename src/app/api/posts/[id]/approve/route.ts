import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.gbpPost.findUnique({
    where: { id: params.id },
    include: { business: { select: { userId: true } } },
  });

  if (!post || post.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.gbpPost.update({
    where: { id: params.id },
    data: {
      status: "draft",
      approvedAt: new Date(),
      approvedBy: "user",
    },
  });

  await queues.gbpPostPublish.add("publish", {
    businessId: post.businessId,
    postId: post.id,
  });

  return NextResponse.json({ success: true });
}
