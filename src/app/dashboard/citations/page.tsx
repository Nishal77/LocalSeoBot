import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ExternalLink, Globe } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning" | "outline"> = {
  live: "success",
  submitted: "default",
  pending: "secondary",
  failed: "destructive",
  rejected: "destructive",
};

export default async function CitationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const realCitations = await prisma.citation.findMany({
    where: { businessId: business.id },
    include: { directory: true },
    orderBy: [
      { directory: { priority: "asc" } },
      { directory: { domainAuthority: "desc" } },
    ],
  });

  const isDemo = realCitations.length === 0;

  // Rich mock data fallback matching Prisma Types exactly
  const citations = isDemo
    ? [
        {
          id: "demo-cit-1",
          businessId: business.id,
          directoryId: "dir-1",
          status: "live",
          listingUrl: "https://maps.google.com",
          submittedAt: new Date(),
          wentLiveAt: new Date(),
          lastVerifiedAt: new Date(),
          napMatch: true,
          submissionMethod: "api",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-1",
            name: "Google Maps",
            url: "https://maps.google.com",
            submissionType: "api",
            category: "Map",
            priority: 1,
            domainAuthority: 100,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-2",
          businessId: business.id,
          directoryId: "dir-2",
          status: "live",
          listingUrl: "https://maps.apple.com",
          submittedAt: new Date(),
          wentLiveAt: new Date(),
          lastVerifiedAt: new Date(),
          napMatch: true,
          submissionMethod: "api",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-2",
            name: "Apple Maps",
            url: "https://maps.apple.com",
            submissionType: "api",
            category: "Map",
            priority: 1,
            domainAuthority: 98,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-3",
          businessId: business.id,
          directoryId: "dir-3",
          status: "submitted",
          listingUrl: "https://yelp.com",
          submittedAt: new Date(),
          wentLiveAt: null,
          lastVerifiedAt: null,
          napMatch: null,
          submissionMethod: "semi_automated",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-3",
            name: "Yelp Business",
            url: "https://yelp.com",
            submissionType: "semi_automated",
            category: "Directory",
            priority: 2,
            domainAuthority: 92,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-4",
          businessId: business.id,
          directoryId: "dir-4",
          status: "submitted",
          listingUrl: "https://tripadvisor.com",
          submittedAt: new Date(),
          wentLiveAt: null,
          lastVerifiedAt: null,
          napMatch: null,
          submissionMethod: "semi_automated",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-4",
            name: "TripAdvisor Local",
            url: "https://tripadvisor.com",
            submissionType: "semi_automated",
            category: "Niche",
            priority: 2,
            domainAuthority: 89,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-5",
          businessId: business.id,
          directoryId: "dir-5",
          status: "pending",
          listingUrl: null,
          submittedAt: null,
          wentLiveAt: null,
          lastVerifiedAt: null,
          napMatch: null,
          submissionMethod: "manual",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-5",
            name: "Foursquare City Guide",
            url: "https://foursquare.com",
            submissionType: "manual",
            category: "Directory",
            priority: 2,
            domainAuthority: 86,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-6",
          businessId: business.id,
          directoryId: "dir-6",
          status: "pending",
          listingUrl: null,
          submittedAt: null,
          wentLiveAt: null,
          lastVerifiedAt: null,
          napMatch: null,
          submissionMethod: "manual",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-6",
            name: "YellowPages Directory",
            url: "https://yellowpages.com",
            submissionType: "manual",
            category: "Directory",
            priority: 2,
            domainAuthority: 82,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-7",
          businessId: business.id,
          directoryId: "dir-7",
          status: "live",
          listingUrl: "https://bing.com/places",
          submittedAt: new Date(),
          wentLiveAt: new Date(),
          lastVerifiedAt: new Date(),
          napMatch: true,
          submissionMethod: "api",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-7",
            name: "Bing Places",
            url: "https://bing.com/places",
            submissionType: "api",
            category: "Map",
            priority: 1,
            domainAuthority: 94,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
        {
          id: "demo-cit-8",
          businessId: business.id,
          directoryId: "dir-8",
          status: "pending",
          listingUrl: null,
          submittedAt: null,
          wentLiveAt: null,
          lastVerifiedAt: null,
          napMatch: null,
          submissionMethod: "manual",
          notes: null,
          createdAt: new Date(),
          directory: {
            id: "dir-8",
            name: "Chamber of Commerce",
            url: "https://chamberofcommerce.com",
            submissionType: "manual",
            category: "Local",
            priority: 2,
            domainAuthority: 78,
            isActive: true,
            apiEndpoint: null,
            formUrl: null,
          },
        },
      ]
    : realCitations;

  const byStatus = {
    live: citations.filter((c) => c.status === "live").length,
    submitted: citations.filter((c) => c.status === "submitted").length,
    pending: citations.filter((c) => c.status === "pending").length,
    failed: citations.filter((c) => c.status === "failed").length,
  };

  const totalCitations = citations.length;
  const progressPercent = totalCitations > 0
    ? Math.round((byStatus.live / totalCitations) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Citation Directories</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Building and syncing your local business presence across 200+ directories.
        </p>
      </div>

      {/* Demo Sandbox Alert */}
      {isDemo && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Mode</span>
            <p className="text-amber-700/90 mt-0.5 font-medium leading-relaxed">
              Real-time directory submission indexing in progress. Showing a preview configuration of your prioritized authority directories.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Live Directory Maps", count: byStatus.live, color: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/10" },
          { label: "Submitted Queues", count: byStatus.submitted, color: "text-blue-600", bg: "bg-blue-500/5 border-blue-500/10" },
          { label: "Verification Pending", count: byStatus.pending, color: "text-zinc-500", bg: "bg-zinc-500/5 border-zinc-500/10" },
          { label: "Issues Detected", count: byStatus.failed, color: "text-red-600", bg: "bg-red-500/5 border-red-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className={`border bg-white ${stat.bg} shadow-sm rounded-2xl p-5 flex flex-col justify-between`}>
            <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.count}</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Segmented Progress */}
      <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-zinc-800 tracking-tight">Synchronization Progress</span>
          <span className="text-sm font-bold text-zinc-900">{progressPercent}% Completed</span>
        </div>
        <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden flex gap-1 select-none pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => {
            const active = (i + 1) * 5 <= progressPercent;
            return (
              <div key={i} className={`h-full flex-1 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-100"}`} />
            );
          })}
        </div>
      </Card>

      {/* Directory list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 tracking-tight mb-2">Monitored Sources</h3>
        {citations.map((citation) => (
          <div
            key={citation.id}
            className="flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-400">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-800 tracking-tight">{citation.directory.name}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                  Domain Authority: {citation.directory.domainAuthority ?? "—"} · Sync: {citation.directory.submissionType?.replace("_", " ") ?? "manual"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={STATUS_VARIANT[citation.status] ?? "secondary"} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
                {citation.status}
              </Badge>
              {citation.listingUrl && (
                <a
                  href={citation.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
