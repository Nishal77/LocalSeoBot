import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DownloadReportButton } from "@/components/dashboard/download-report-button";

export const metadata = { title: "Weekly Report — RankAgent AI" };

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
    <div className="max-w-4xl mx-auto pb-10 print-report-container">
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-100 pb-6 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm" className="border-zinc-200/80 rounded-xl font-semibold text-zinc-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Report</h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">
              Week of {weekOf.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <DownloadReportButton />
      </div>

      {/* Printable Area */}
      <div className="bg-white border border-zinc-200/60 rounded-2xl p-8 shadow-sm">
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">LocalSEOBot Report</span>
            <span className="text-sm font-semibold text-zinc-800">
              {weekOf.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-950">{report.business.name}</h2>
          <p className="text-xs text-zinc-450 font-semibold mt-1">SEO Autopilot Performance Log</p>
        </div>

        {report.reportHtml ? (
          <div
            className="prose prose-zinc max-w-none text-zinc-800 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: report.reportHtml }}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Posts published", value: report.postsPublished },
                { label: "Citations submitted", value: report.citationsSubmitted },
                { label: "Reviews responded", value: report.reviewsResponded },
                { label: "Keywords improved", value: report.keywordsImproved },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-zinc-50 rounded-2xl border border-zinc-150/60">
                  <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{stat.value}</div>
                  <div className="text-xs text-zinc-500 font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-zinc-200/60 bg-white">
                <div className="text-xs font-semibold text-zinc-500 tracking-tight mb-1.5">Average rating this week</div>
                <div className="text-xl font-bold text-zinc-900">
                  {report.avgRatingThisWeek ? `${Number(report.avgRatingThisWeek).toFixed(1)} ⭐` : "No reviews"}
                </div>
              </div>
              <div className="p-5 rounded-2xl border border-zinc-200/60 bg-white">
                <div className="text-xs font-semibold text-zinc-500 tracking-tight mb-1.5">Citations live</div>
                <div className="text-xl font-bold text-zinc-900">{report.citationsLive}</div>
              </div>
            </div>

            {report.sentAt && (
              <p className="text-xs text-zinc-400 font-semibold mt-4">
                Sent via email on {new Date(report.sentAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
