import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");
  const token = searchParams.get("token");

  if (!reviewId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate token = sha256(reviewId + secret)
  const expectedToken = Buffer.from(
    `${reviewId}:${process.env.NEXTAUTH_SECRET}`
  ).toString("base64url").slice(0, 32);

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (review.responseStatus !== "pending_approval") {
    return NextResponse.redirect(new URL("/dashboard/reviews?approved=already", req.url));
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { responseStatus: "approved", respondedBy: "user" },
  });

  await queues.reviewRespond.add("review.respond", {
    reviewId,
    businessId: review.businessId,
    approved: true,
  });

  return NextResponse.redirect(new URL("/dashboard/reviews?approved=true", req.url));
}
