import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { MapPin, Star, BarChart2, Bot, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: {
      citations: { select: { status: true } },
      reviews: { select: { starRating: true, responseStatus: true } },
      keywords: {
        where: { isActive: true },
        include: {
          rankings: { orderBy: { checkedAt: "desc" }, take: 1 },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!business) redirect("/");

  const citationsLive = business.citations.filter((c) => c.status === "live").length;
  const citationsTotal = business.citations.length;

  const totalReviews = business.reviews.length;
  const avgRating = totalReviews > 0
    ? business.reviews.reduce((s, r) => s + (r.starRating ?? 0), 0) / totalReviews
    : 0;

  const rankedKeywords = business.keywords.filter((k) => k.rankings[0]?.mapsRank != null);
  const avgRank = rankedKeywords.length > 0
    ? rankedKeywords.reduce((s, k) => s + (k.rankings[0].mapsRank ?? 0), 0) / rankedKeywords.length
    : null;

  const daysSinceStart = business.createdAt
    ? differenceInDays(new Date(), business.createdAt)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Your bot is running. Here&apos;s what it&apos;s done.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citations live</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citationsLive} / 200</div>
            <Progress value={(citationsLive / 200) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{citationsTotal} submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {avgRating > 0 ? `${avgRating.toFixed(1)} ★ avg` : "No reviews yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg keyword rank</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgRank ? `#${avgRank.toFixed(1)}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {business.keywords.length} keywords tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bot status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${business.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
              <div className="text-2xl font-bold capitalize">{business.status}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Running for {daysSinceStart} day{daysSinceStart !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent bot activity</CardTitle>
        </CardHeader>
        <CardContent>
          {business.auditLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No activity yet. The bot will start running shortly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {business.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  {log.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : log.status === "failed" ? (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{log.jobType?.replace(".", " › ")}</span>
                      <Badge
                        variant={log.status === "success" ? "success" : log.status === "failed" ? "destructive" : "secondary"}
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                      {log.durationMs ? ` · ${log.durationMs}ms` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
