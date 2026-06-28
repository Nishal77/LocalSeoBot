import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";
import { z } from "zod";

const requestBodySchema = z.object({
  businessId: z.string().uuid(),
  customers: z.array(
    z.object({
      name: z.string().min(1).max(255),
      phone: z.string().min(5).max(50),
    })
  ).min(1).max(100), // process max 100 requests per request
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = requestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { businessId, customers } = parsed.data;

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or access denied" }, { status: 404 });
    }

    const createdRequests = [];

    for (const customer of customers) {
      // Create request in DB
      const r = await prisma.reviewRequest.create({
        data: {
          businessId,
          customerName: customer.name,
          customerPhone: customer.phone,
          status: "pending",
        },
      });

      // Queue the SMS send job
      // Stagger them slightly if needed, or queue immediately
      await queues.reviewRequestSend.add("send", { reviewRequestId: r.id });

      createdRequests.push(r);
    }

    return NextResponse.json({
      success: true,
      message: `Enqueued ${createdRequests.length} review request messages`,
      requests: createdRequests,
    });
  } catch (err) {
    console.error("[ReviewRequestRoute] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
