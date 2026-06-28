import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  listingUrl: z.string().url(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isAdmin =
    user?.role === "admin" ||
    user?.email === "admin@localseobot.com" ||
    user?.email?.startsWith("admin@");

  if (!isAdmin) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const citationId = params.id;

    const citation = await prisma.citation.update({
      where: { id: citationId },
      data: {
        status: "live",
        listingUrl: parsed.data.listingUrl,
        wentLiveAt: new Date(),
        lastVerifiedAt: new Date(),
        napMatch: true,
      },
    });

    return NextResponse.json({ success: true, citation });
  } catch (err) {
    console.error("[Admin Citation Verify API] error:", err);
    return NextResponse.json({ error: "Failed to verify citation" }, { status: 500 });
  }
}
