import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default async function RankingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const keywords = await prisma.keyword.findMany({
    where: { businessId: business.id, isActive: true },
    include: {
      rankings: {
        orderBy: { checkedAt: "desc" },
        take: 2,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Keyword Rankings</h1>
        <p className="text-muted-foreground mt-1">
          {keywords.length} keywords tracked · Updated every Monday
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking positions</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No keywords tracked yet. Complete onboarding to auto-generate keywords.
            </p>
          ) : (
            <div className="space-y-0">
              <div className="grid grid-cols-4 gap-4 py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b">
                <div className="col-span-2">Keyword</div>
                <div className="text-center">Maps rank</div>
                <div className="text-center">Change</div>
              </div>
              {keywords.map((kw) => {
                const current = kw.rankings[0]?.mapsRank ?? null;
                const prev = kw.rankings[1]?.mapsRank ?? null;
                const change = current !== null && prev !== null ? prev - current : null;

                return (
                  <div key={kw.id} className="grid grid-cols-4 gap-4 py-3 px-3 border-b last:border-0 hover:bg-gray-50">
                    <div className="col-span-2">
                      <span className="text-sm font-medium">{kw.keyword}</span>
                      {kw.rankings[0]?.competitorAbove && (
                        <div className="text-xs text-muted-foreground">
                          Above: {kw.rankings[0].competitorAbove}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      {current !== null ? (
                        <Badge variant="outline">#{current}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-center flex items-center justify-center">
                      {change === null ? (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      ) : change > 0 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">+{change}</span>
                        </div>
                      ) : change < 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm">{change}</span>
                        </div>
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
