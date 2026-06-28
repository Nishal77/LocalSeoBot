import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGBPMedia, createGBPMedia } from "@/lib/gbp";
import { z } from "zod";

const uploadSchema = z.object({
  sourceUrl: z.string().url(),
  mediaFormat: z.enum(["PHOTO", "VIDEO"]).default("PHOTO"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { googleConnection: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const hasGBP = !!business.googleConnection && !!business.gbpLocationId && !!business.gbpAccountId;

  if (hasGBP) {
    try {
      const mediaList = await getGBPMedia(
        business.id,
        business.gbpAccountId!,
        business.gbpLocationId!
      );
      return NextResponse.json({ media: mediaList.mediaItems ?? [] });
    } catch (err) {
      console.warn("[GBP Media API] Failed to fetch live media, using mock data:", err);
    }
  }

  // Fallback / Sandbox Mock Data
  const mockMedia = [
    {
      name: `mock-media-1`,
      googleUrl: "/images/image1.jpeg",
      createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: `mock-media-2`,
      googleUrl: "/images/image2.jpeg",
      createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: `mock-media-3`,
      googleUrl: "/images/image3.jpeg",
      createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({ media: mockMedia });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { googleConnection: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { sourceUrl, mediaFormat } = parsed.data;
    const hasGBP = !!business.googleConnection && !!business.gbpLocationId && !!business.gbpAccountId;

    if (hasGBP) {
      const gbpMedia = await createGBPMedia(
        business.id,
        business.gbpAccountId!,
        business.gbpLocationId!,
        {
          mediaFormat,
          sourceUrl,
        }
      );
      return NextResponse.json({ success: true, media: gbpMedia });
    }

    // Sandbox success response
    return NextResponse.json({
      success: true,
      media: {
        name: `mock-media-${Date.now()}`,
        googleUrl: sourceUrl,
        createTime: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[GBP Media Upload API] error:", err);
    return NextResponse.json({ error: "Failed to upload photo to Google Business Profile" }, { status: 500 });
  }
}
