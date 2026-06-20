import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.gbpPost.findUnique({
    where: { id: params.id },
    include: { business: { select: { userId: true } } },
  });

  if (!post || post.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json() as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.gbpPost.update({
    where: { id: params.id },
    data: { content: parsed.data.content },
  });

  return NextResponse.json(updated);
}
