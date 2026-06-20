import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

export const metadata = { title: "Billing — LocalSEOBot" };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { subscriptions: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  if (!business) redirect("/onboarding");

  const sub = business.subscriptions[0];
  const trialEnd = sub?.trialEnd ? new Date(sub.trialEnd) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000))
    : null;

  const statusColor = {
    trialing: "text-blue-600 bg-blue-50",
    active: "text-green-600 bg-green-50",
    past_due: "text-red-600 bg-red-50",
    cancelled: "text-gray-600 bg-gray-50",
  }[sub?.status ?? "trialing"] ?? "text-gray-600 bg-gray-50";

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>LocalSEOBot Starter — $99/month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sub ? (
            <>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {sub.status === "trialing" && <Clock className="h-3.5 w-3.5" />}
                  {sub.status === "active" && <CheckCircle className="h-3.5 w-3.5" />}
                  {sub.status === "past_due" && <AlertTriangle className="h-3.5 w-3.5" />}
                  {sub.status === "trialing"
                    ? `Trial — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                    : (sub.status ?? "").replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </div>

              {sub.status === "trialing" && trialEnd && (
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  Your free trial ends on {trialEnd.toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}. After that, you&apos;ll be charged $99/month to continue service.
                </div>
              )}

              {sub.status === "past_due" && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  Your payment is past due. Please update your billing information to continue service.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-sm text-muted-foreground">Plan</div>
                  <div className="font-medium capitalize">{sub.plan}</div>
                </div>
                {sub.currentPeriodEnd && (
                  <div>
                    <div className="text-sm text-muted-foreground">Next billing date</div>
                    <div className="font-medium">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link href="/api/billing/portal">
                  <Button variant="outline">Manage billing on Whop</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">No active subscription found.</p>
              <Link href="/api/billing/portal">
                <Button>Start subscription</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              "1 Google Business Profile location",
              "1 AI-written GBP post per week",
              "200+ citation directory submissions",
              "Automated review responses (within 2 hours)",
              "Weekly keyword tracking (20 keywords)",
              "Monday morning email reports",
              "Competitor monitoring (5 competitors)",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
