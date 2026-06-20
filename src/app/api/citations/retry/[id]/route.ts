import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const citation = await prisma.citation.findFirst({
    where: { id: params.id, businessId: business.id },
  });

  if (!citation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.citation.update({
    where: { id: params.id },
    data: { status: "pending", submittedAt: null, notes: null },
  });

  return NextResponse.json({ success: true, message: "Citation reset for retry" });
}
