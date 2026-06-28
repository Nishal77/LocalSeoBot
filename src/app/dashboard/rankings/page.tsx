import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

export default async function RankingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const realKeywords = await prisma.keyword.findMany({
    where: { businessId: business.id, isActive: true },
    include: {
      rankings: {
        orderBy: { checkedAt: "desc" },
        take: 2,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const isDemo = realKeywords.length === 0;

  // Rich mock data fallback
  const keywords = isDemo
    ? [
        {
          id: "demo-kw-1",
          keyword: "best local service near me",
          rankings: [
            { mapsRank: 3, competitorAbove: "Local Pro Services Ltd" },
            { mapsRank: 5 },
          ],
        },
        {
          id: "demo-kw-2",
          keyword: "top business Austin TX",
          rankings: [
            { mapsRank: 8, competitorAbove: "Austin Premier Team" },
            { mapsRank: 7 },
          ],
        },
        {
          id: "demo-kw-3",
          keyword: "local provider review rating",
          rankings: [
            { mapsRank: 12, competitorAbove: "Elite Operator Inc" },
            { mapsRank: 12 },
          ],
        },
        {
          id: "demo-kw-4",
          keyword: "business consultation service",
          rankings: [
            { mapsRank: 1, competitorAbove: null },
            { mapsRank: 6 },
          ],
        },
        {
          id: "demo-kw-5",
          keyword: "reliable operator reviews",
          rankings: [
            { mapsRank: null, competitorAbove: null },
            { mapsRank: null },
          ],
        },
      ]
    : realKeywords;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Keyword Rankings</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Track Google Maps organic listing search positions for your selected focus keywords.
        </p>
      </div>

      {/* Demo Sandbox Alert */}
      {isDemo && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Mode</span>
            <p className="text-amber-700/90 mt-0.5 font-medium leading-relaxed">
              Google Maps rank indexing runs weekly. Showing mock preview tracking logs for focus keyword search performance.
            </p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="min-w-full divide-y divide-zinc-100 select-none">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-4 py-3.5 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
              <div className="col-span-2">Keyword Target</div>
              <div className="text-center">Maps Rank</div>
              <div className="text-center">Weekly Change</div>
            </div>
            
            {/* Data rows */}
            <div className="divide-y divide-zinc-50">
              {keywords.map((kw) => {
                const current = kw.rankings[0]?.mapsRank ?? null;
                const prev = kw.rankings[1]?.mapsRank ?? null;
                const change = current !== null && prev !== null ? prev - current : null;

                return (
                  <div key={kw.id} className="grid grid-cols-4 gap-4 py-4 px-6 items-center hover:bg-zinc-50/20 transition-colors">
                    <div className="col-span-2 min-w-0 pr-4">
                      <span className="text-sm font-semibold text-zinc-800 tracking-tight block truncate">{kw.keyword}</span>
                      {kw.rankings[0]?.competitorAbove && (
                        <div className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate">
                          Ahead: <span className="font-semibold text-zinc-500">{kw.rankings[0].competitorAbove}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center flex justify-center">
                      {current !== null ? (
                        <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          current <= 3 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                            : current <= 10 
                              ? "bg-blue-50 text-blue-700 border-blue-250" 
                              : "bg-zinc-50 text-zinc-700 border-zinc-250"
                        }`}>
                          Rank #{current}
                        </Badge>
                      ) : (
                        <span className="text-xs text-zinc-400 font-semibold tracking-tight">—</span>
                      )}
                    </div>
                    <div className="text-center flex items-center justify-center">
                      {change === null || change === 0 ? (
                        <Minus className="h-4 w-4 text-zinc-300" />
                      ) : change > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs tracking-tight">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>+{change} spots</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-650 font-bold text-xs tracking-tight">
                          <TrendingDown className="h-3.5 w-3.5" />
                          <span>{change} spots</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
