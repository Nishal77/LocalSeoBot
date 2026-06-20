import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  postTone: z.enum(["professional", "casual", "friendly"]).optional(),
  postFrequency: z.enum(["weekly", "biweekly"]).optional(),
  postApprovalRequired: z.boolean().optional(),
  reviewApprovalRequired: z.boolean().optional(),
  reviewAutoPostAfterHours: z.number().int().min(1).max(72).optional(),
  avoidTopics: z.array(z.string()).optional(),
  customInstructions: z.string().max(2000).optional(),
  reviewRequestEnabled: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { botSettings: true },
  });

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(business.botSettings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as unknown;
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const settings = await prisma.botSettings.upsert({
    where: { businessId: business.id },
    create: { businessId: business.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(settings);
}
