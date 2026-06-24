import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      websiteUrl: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      zip: true,
      phone: true,
      category: true,
      nicheTags: true,
      gbpLocationId: true,
    },
  });
  if (!business) redirect("/onboarding");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Business info</h1>
        <p className="text-muted-foreground mt-1">
          Update your business NAP (name, address, phone). Changes sync to all citation tracking.
        </p>
      </div>
      <BusinessSettingsForm business={business} />
    </div>
  );
}
