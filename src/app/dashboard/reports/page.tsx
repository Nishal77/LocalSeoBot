import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const realReports = await prisma.weeklyReport.findMany({
    where: { businessId: business.id },
    orderBy: { weekOf: "desc" },
  });

  const isDemo = realReports.length === 0;

  // Rich mock data fallback
  const reports = isDemo
    ? [
        {
          id: "demo-rep-1",
          weekOf: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          postsPublished: 1,
          citationsSubmitted: 8,
          reviewsResponded: 3,
          keywordsImproved: 4,
        },
        {
          id: "demo-rep-2",
          weekOf: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          postsPublished: 1,
          citationsSubmitted: 12,
          reviewsResponded: 2,
          keywordsImproved: 2,
        },
        {
          id: "demo-rep-3",
          weekOf: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          postsPublished: 2,
          citationsSubmitted: 15,
          reviewsResponded: 5,
          keywordsImproved: 6,
        },
      ]
    : realReports;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Weekly Reports</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Review weekly summary digests sent directly to your inbox every Monday at 8:00 AM.
        </p>
      </div>

      {/* Demo Sandbox Alert */}
      {isDemo && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Mode</span>
            <p className="text-amber-700/90 mt-0.5 font-medium leading-relaxed">
              Your business was registered this week. Weekly summary aggregates begin next Monday. Showing sandbox preview metrics from standard cycles.
            </p>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="bg-white border-zinc-200/60 shadow-sm rounded-2xl hover:shadow-md/5 transition-all overflow-hidden">
            <div className="p-6">
              {/* Header meta */}
              <div className="flex items-center justify-between border-b border-zinc-50 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 flex-shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm text-zinc-800 tracking-tight">
                    Week of {format(report.weekOf, "MMMM d, yyyy")}
                  </span>
                </div>
                <Badge variant={report.sentAt ? "success" : "secondary"} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
                  {report.sentAt ? "Delivered" : "Pending"}
                </Badge>
              </div>

              {/* Data row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center select-none mb-5">
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-3">
                  <div className="text-lg font-bold text-zinc-850 tracking-tight">{report.postsPublished}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Posts published</div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-3">
                  <div className="text-lg font-bold text-zinc-850 tracking-tight">{report.citationsSubmitted}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Citations submitted</div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-3">
                  <div className="text-lg font-bold text-zinc-850 tracking-tight">{report.reviewsResponded}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Reviews answered</div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-3">
                  <div className="text-lg font-bold text-emerald-600 tracking-tight">+{report.keywordsImproved}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Keywords improved</div>
                </div>
              </div>

              {/* Action link */}
              <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
                <span className="text-[11px] text-zinc-400 font-semibold tracking-tight">Report digest complete and archived</span>
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
                >
                  View full report
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
