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
    <div className="space-y-8 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Configure AI agent automation parameters and GBP post preferences.
        </p>
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
