import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const reports = await prisma.weeklyReport.findMany({
    where: { businessId: business.id },
    orderBy: { weekOf: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Reports</h1>
        <p className="text-muted-foreground mt-1">Sent every Monday at 8am</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Your first report will arrive next Monday at 8am.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Week of {format(report.weekOf, "MMMM d, yyyy")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {report.sentAt ? (
                      <Badge variant="success">Sent</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{report.postsPublished}</div>
                    <div className="text-muted-foreground">Posts published</div>
                  </div>
                  <div>
                    <div className="font-medium">{report.citationsSubmitted}</div>
                    <div className="text-muted-foreground">Citations submitted</div>
                  </div>
                  <div>
                    <div className="font-medium">{report.reviewsResponded}</div>
                    <div className="text-muted-foreground">Reviews responded</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-600">+{report.keywordsImproved}</div>
                    <div className="text-muted-foreground">Rankings improved</div>
                  </div>
                </div>
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  View full report →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
