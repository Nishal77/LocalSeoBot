import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Users, Store, Inbox } from "lucide-react";
import CitationsTable from "./citations-table";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isAdmin =
    user?.role === "admin" ||
    user?.email === "admin@localseobot.com" ||
    user?.email?.startsWith("admin@");

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <div className="h-12 w-12 bg-red-100 text-red-650 rounded-xl flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Admin Access Required</h1>
        <p className="text-zinc-500 text-sm font-medium">
          Your account does not have permission to view the internal operations queue. Please log in as an administrator.
        </p>
      </div>
    );
  }

  // Fetch admin stats
  const [usersCount, businessesCount, pendingCitations] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.citation.findMany({
      where: {
        status: { in: ["pending", "submitted"] },
        directory: { submissionType: "manual" },
      },
      include: {
        business: {
          select: {
            name: true,
            phone: true,
            websiteUrl: true,
            addressLine1: true,
            city: true,
            state: true,
            zip: true,
          },
        },
        directory: {
          select: {
            name: true,
            url: true,
            priority: true,
          },
        },
      },
      orderBy: [
        { directory: { priority: "asc" } },
        { directory: { domainAuthority: "desc" } },
      ],
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Admin Console</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Manage system-wide accounts, track platform usage, and resolve manual citation submission tasks.
          </p>
        </div>
        <div>
          <Badge className="bg-red-500/10 text-red-750 hover:bg-red-500/10 border border-red-500/20 text-xs font-semibold px-2.5 py-1 rounded-full select-none">
            System Operations
          </Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Total Accounts</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{usersCount}</div>
          </div>
        </Card>

        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Total Locations</span>
            <Store className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{businessesCount}</div>
          </div>
        </Card>

        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Manual Citations Queue</span>
            <Inbox className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{pendingCitations.length}</div>
          </div>
        </Card>
      </div>

      {/* Manual Citations Queue Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Manual Submissions Queue</h2>
          <Badge className="bg-zinc-100 border border-zinc-200 text-zinc-550 hover:bg-zinc-100 select-none">
            Requires Human Review
          </Badge>
        </div>

        <CitationsTable initialCitations={pendingCitations} />
      </div>
    </div>
  );
}
