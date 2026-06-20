import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function Stars({ n }: { n: number }) {
  return <span>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const reviews = await prisma.review.findMany({
    where: { businessId: business.id },
    orderBy: { reviewDate: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          {reviews.length} reviews · {reviews.filter((r) => r.responseStatus === "posted").length} responded
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reviews found yet. The bot polls every 30 minutes.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{review.reviewerName ?? "Anonymous"}</div>
                    {review.starRating && (
                      <span className="text-yellow-500">
                        <Stars n={review.starRating} />
                      </span>
                    )}
                    <Badge variant={review.sentiment === "positive" ? "success" : review.sentiment === "negative" ? "destructive" : "secondary"}>
                      {review.sentiment ?? "—"}
                    </Badge>
                  </div>
                  {review.reviewDate && (
                    <span className="text-sm text-muted-foreground">
                      {format(review.reviewDate, "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{review.reviewText ?? "(No text)"}</p>
                {review.responseText && (
                  <div className="rounded-md bg-gray-50 p-3 border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">Bot response</span>
                      <Badge variant={review.responseStatus === "posted" ? "success" : "secondary"}>
                        {review.responseStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.responseText}</p>
                  </div>
                )}
                {!review.responseText && review.responseStatus === "pending" && (
                  <p className="text-xs text-muted-foreground italic">Response being generated...</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
