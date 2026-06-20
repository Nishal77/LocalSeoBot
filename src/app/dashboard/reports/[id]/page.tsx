import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Weekly Report — LocalSEOBot" };

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const report = await prisma.weeklyReport.findUnique({
    where: { id: params.id },
    include: { business: { select: { userId: true, name: true } } },
  });

  if (!report || report.business.userId !== session.user.id) notFound();

  const weekOf = new Date(report.weekOf);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Weekly Report</h1>
          <p className="text-muted-foreground text-sm">
            Week of {weekOf.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {report.reportHtml ? (
        <div
          className="prose prose-sm max-w-none border rounded-lg p-6 bg-white"
          dangerouslySetInnerHTML={{ __html: report.reportHtml }}
        />
      ) : (
        <div className="border rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Posts published", value: report.postsPublished },
              { label: "Citations submitted", value: report.citationsSubmitted },
              { label: "Reviews responded", value: report.reviewsResponded },
              { label: "Keywords improved", value: report.keywordsImproved },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="text-sm font-medium mb-1">Average rating this week</div>
              <div className="text-xl font-bold">
                {report.avgRatingThisWeek ? `${Number(report.avgRatingThisWeek).toFixed(1)} ⭐` : "No reviews"}
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm font-medium mb-1">Citations live</div>
              <div className="text-xl font-bold">{report.citationsLive}</div>
            </div>
          </div>

          {report.sentAt && (
            <p className="text-xs text-muted-foreground">
              Sent {new Date(report.sentAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
