import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteGBPMedia } from "@/lib/gbp";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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

  const mediaId = params.id;
  const isMock = mediaId.startsWith("mock-");

  if (!isMock && business.googleConnection && business.gbpLocationId && business.gbpAccountId) {
    try {
      await deleteGBPMedia(
        business.id,
        business.gbpAccountId!,
        business.gbpLocationId!,
        mediaId
      );
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("[GBP Media Delete API] error:", err);
      return NextResponse.json({ error: "Failed to delete photo from Google Business Profile" }, { status: 500 });
    }
  }

  // Sandbox mock success
  return NextResponse.json({ success: true, message: "Sandbox mock deletion success" });
}
