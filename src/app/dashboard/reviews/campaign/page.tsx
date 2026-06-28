import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import CampaignForm from "./campaign-form";

export default async function CampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  // Get campaign stats
  const requests = await prisma.reviewRequest.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = requests.length;
  const sent = requests.filter((r) => r.status === "sent").length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const failed = requests.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">SMS Review Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Send automated SMS messages to your recent customers to request Google Reviews.
          </p>
        </div>
        <div>
          <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-full select-none">
            Campaign Tool
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Total Requests</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{total}</div>
          </div>
        </Card>

        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Sent SMS</span>
            <Send className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{sent}</div>
          </div>
        </Card>

        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Pending</span>
            <Clock className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{pending}</div>
          </div>
        </Card>

        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Failed</span>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{failed}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-1">
          <Card className="border-zinc-200/60 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Send Request</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignForm businessId={business.id} />
            </CardContent>
          </Card>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Campaign History</h2>
          
          <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 tracking-wider">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {total === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-400 font-medium">
                        No requests sent yet. Import customer info to start.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-800">{r.customerName}</td>
                        <td className="py-3.5 px-4 text-zinc-500">{r.customerPhone}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            {r.status === "sent" && (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-700 text-xs font-semibold">Sent</span>
                              </>
                            )}
                            {r.status === "pending" && (
                              <>
                                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="text-zinc-650 text-xs font-semibold">Pending</span>
                              </>
                            )}
                            {r.status === "failed" && (
                              <>
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                                <span className="text-red-700 text-xs font-semibold">Failed</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 text-xs font-semibold">
                          {new Date(r.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
