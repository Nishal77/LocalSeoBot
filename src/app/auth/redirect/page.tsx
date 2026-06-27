import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  redirect(business ? "/dashboard" : "/onboarding");
}
