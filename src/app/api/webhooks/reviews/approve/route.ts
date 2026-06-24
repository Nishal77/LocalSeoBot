import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";
import { createHmac } from "crypto";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");
  const token = searchParams.get("token");

  if (!reviewId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  const expectedToken = createHmac("sha256", secret).update(reviewId).digest("hex");

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
