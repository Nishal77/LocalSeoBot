import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const keyword = await prisma.keyword.findFirst({
    where: { id: params.id, businessId: business.id },
  });
  if (!keyword) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.keyword.update({ where: { id: params.id }, data: { isActive: false } });

  return NextResponse.json({ success: true });
}
