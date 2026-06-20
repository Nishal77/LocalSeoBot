import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BotSettingsForm } from "@/components/dashboard/bot-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { botSettings: true },
  });
  if (!business) redirect("/onboarding");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure bot behavior and preferences</p>
      </div>

      <BotSettingsForm
        businessId={business.id}
        settings={{
          postTone: business.botSettings?.postTone ?? "professional",
          postFrequency: business.botSettings?.postFrequency ?? "weekly",
          postApprovalRequired: business.botSettings?.postApprovalRequired ?? false,
          reviewApprovalRequired: business.botSettings?.reviewApprovalRequired ?? false,
          reviewAutoPostAfterHours: business.botSettings?.reviewAutoPostAfterHours ?? 4,
          avoidTopics: business.botSettings?.avoidTopics ?? [],
          customInstructions: business.botSettings?.customInstructions ?? "",
          reviewRequestEnabled: business.botSettings?.reviewRequestEnabled ?? false,
        }}
      />
    </div>
  );
}
