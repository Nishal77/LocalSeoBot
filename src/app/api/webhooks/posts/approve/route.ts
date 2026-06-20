import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const token = searchParams.get("token");

  if (!postId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const post = await prisma.gbpPost.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const expectedToken = Buffer.from(
    `${postId}:${process.env.NEXTAUTH_SECRET}`
  ).toString("base64url").slice(0, 32);

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (post.status !== "pending_approval") {
    return NextResponse.redirect(new URL("/dashboard/posts?approved=already", req.url));
  }

  await prisma.gbpPost.update({
    where: { id: postId },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedBy: "user",
    },
  });

  await queues.gbpPostPublish.add("gbp.post.publish", {
    postId,
    businessId: post.businessId,
  });

  return NextResponse.redirect(new URL("/dashboard/posts?approved=true", req.url));
}
