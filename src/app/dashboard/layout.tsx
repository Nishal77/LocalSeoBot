import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [business, user] = await Promise.all([
    prisma.business.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        onboardingComplete: true,
        trialEndsAt: true,
        googleConnection: { select: { id: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true },
    }),
  ]);

  if (!business?.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        businessName={business.name}
        businessId={business.id}
        hasGBP={!!business.googleConnection}
        status={business.status}
        trialEndsAt={business.trialEndsAt?.toISOString() ?? null}
        userRole={user?.role ?? "user"}
        userEmail={user?.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
