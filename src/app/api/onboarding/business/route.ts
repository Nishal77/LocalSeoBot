import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const businessSchema = z.object({
  name: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  category: z.string().max(100).optional(),
  nicheTags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = businessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, websiteUrl, addressLine1, city, state, zip, phone, category, nicheTags } = parsed.data;

    // Upsert — user might be re-doing onboarding
    const existing = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    const business = existing
      ? await prisma.business.update({
          where: { id: existing.id },
          data: { name, websiteUrl: websiteUrl || null, addressLine1, city, state, zip, phone, category, nicheTags: nicheTags ?? [] },
        })
      : await prisma.business.create({
          data: {
            userId: session.user.id,
            name,
            websiteUrl: websiteUrl || null,
            addressLine1,
            city,
            state,
            zip,
            phone,
            category,
            nicheTags: nicheTags ?? [],
            timezone: "America/New_York",
          },
        });

    return NextResponse.json({ businessId: business.id });
  } catch (err) {
    console.error("Business save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
