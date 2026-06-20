import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  category: z.string().max(100).optional(),
  nicheTags: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true, name: true, websiteUrl: true, addressLine1: true, addressLine2: true,
      city: true, state: true, zip: true, phone: true, category: true, nicheTags: true,
      timezone: true, status: true, gbpLocationId: true,
    },
  });

  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });
  return NextResponse.json({ business });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: parsed.data,
  });

  return NextResponse.json({ business: updated });
}
