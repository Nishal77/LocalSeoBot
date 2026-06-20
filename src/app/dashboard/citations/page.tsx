import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning" | "outline"> = {
  live: "success",
  submitted: "default",
  pending: "secondary",
  failed: "destructive",
  rejected: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  submitted: "Submitted",
  pending: "Pending",
  failed: "Failed",
  rejected: "Rejected",
};

export default async function CitationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const citations = await prisma.citation.findMany({
    where: { businessId: business.id },
    include: { directory: true },
    orderBy: [
      { directory: { priority: "asc" } },
      { directory: { domainAuthority: "desc" } },
    ],
  });

  const byStatus = {
    live: citations.filter((c) => c.status === "live").length,
    submitted: citations.filter((c) => c.status === "submitted").length,
    pending: citations.filter((c) => c.status === "pending").length,
    failed: citations.filter((c) => c.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citation Directories</h1>
        <p className="text-muted-foreground mt-1">
          Building your presence across 200+ directories
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live", count: byStatus.live, color: "text-green-600" },
          { label: "Submitted", count: byStatus.submitted, color: "text-blue-600" },
          { label: "Pending", count: byStatus.pending, color: "text-gray-500" },
          { label: "Failed", count: byStatus.failed, color: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Overall progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{byStatus.live} directories live</span>
            <span className="font-medium">{Math.round((byStatus.live / 200) * 100)}%</span>
          </div>
          <Progress value={(byStatus.live / 200) * 100} />
        </CardContent>
      </Card>

      {/* Directory list */}
      <div className="space-y-2">
        {citations.map((citation) => (
          <div
            key={citation.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-white"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-sm">{citation.directory.name}</div>
                <div className="text-xs text-muted-foreground">
                  DA {citation.directory.domainAuthority ?? "—"} · {citation.directory.submissionType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {citation.listingUrl && (
                <a
                  href={citation.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View listing
                </a>
              )}
              <Badge variant={STATUS_VARIANT[citation.status] ?? "secondary"}>
                {STATUS_LABEL[citation.status] ?? citation.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
