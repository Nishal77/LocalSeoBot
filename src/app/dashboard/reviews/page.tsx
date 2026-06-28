import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, Star, MessageSquareQuote } from "lucide-react";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-current" : "text-zinc-200"}`} />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const realReviews = await prisma.review.findMany({
    where: { businessId: business.id },
    orderBy: { reviewDate: "desc" },
    take: 50,
  });

  const isDemo = realReviews.length === 0;

  // Rich mock data fallback
  const reviews = isDemo
    ? [
        {
          id: "demo-rev-1",
          reviewerName: "Marcus K.",
          starRating: 5,
          sentiment: "positive",
          reviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          reviewText: "Outstanding customer service. They walked me through everything and delivered exactly what was promised. High-quality work!",
          responseText: "Hi Marcus, thank you so much for the 5-star rating! We are thrilled to hear you had an outstanding experience and look forward to working with you again.",
          responseStatus: "posted",
          respondedBy: "bot",
        },
        {
          id: "demo-rev-2",
          reviewerName: "Jessica L.",
          starRating: 5,
          sentiment: "positive",
          reviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          reviewText: "Fast turnaround and extremely polite team. Will definitely use them again for future projects.",
          responseText: "Hi Jessica, thank you for your kind words! Our team prides itself on fast, high-quality turnarounds and we're so glad to help. See you next time!",
          responseStatus: "posted",
          respondedBy: "user",
        },
        {
          id: "demo-rev-3",
          reviewerName: "Dave H.",
          starRating: 4,
          sentiment: "positive",
          reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          reviewText: "Good work overall, just had a minor delay on initial setup but the support team resolved it immediately.",
          responseText: "Hi Dave, thank you for the feedback. We apologize for the initial setup delay, but we're glad our support team resolved it swiftly. Thank you for your support!",
          responseStatus: "posted",
          respondedBy: "bot",
        },
        {
          id: "demo-rev-4",
          reviewerName: "Sarah P.",
          starRating: 3,
          sentiment: "neutral",
          reviewDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          reviewText: "Decent services. The pricing is fair, just wish there was a bit more communication upfront.",
          responseText: "Hi Sarah, thank you for the review. We are always working to improve our upfront communication and appreciate your feedback to help us grow.",
          responseStatus: "pending",
          respondedBy: "bot",
        },
      ]
    : realReviews;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Reviews</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Monitor incoming customer ratings and automate AI-crafted auto-replies.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-zinc-100 text-zinc-650 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-full select-none">
            {reviews.length} Total Reviews
          </Badge>
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full select-none">
            {reviews.filter((r) => r.responseStatus === "posted").length} Responded
          </Badge>
        </div>
      </div>

      {/* Demo Sandbox Alert */}
      {isDemo && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Mode</span>
            <p className="text-amber-700/90 mt-0.5 font-medium leading-relaxed">
              Google Review Sync polling is active. Showing preview of latest client reviews and auto-drafted bot response structures.
            </p>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-5">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              {/* Card Meta Header */}
              <div className="flex items-center justify-between border-b border-zinc-50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-800 tracking-tight">{review.reviewerName ?? "Anonymous"}</span>
                  {review.starRating && <Stars n={review.starRating} />}
                  {review.sentiment && (
                    <Badge
                      variant={review.sentiment === "positive" ? "success" : review.sentiment === "negative" ? "destructive" : "secondary"}
                      className="text-[10px] font-semibold px-2 py-0.2 rounded-full capitalize"
                    >
                      {review.sentiment}
                    </Badge>
                  )}
                </div>
                {review.reviewDate && (
                  <span className="text-xs text-zinc-400 font-semibold">
                    {format(review.reviewDate, "MMM d, yyyy")}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-zinc-700 text-sm leading-relaxed font-medium">{review.reviewText ?? "(No text content provided)"}</p>
                
                {review.responseText && (
                  <div className="rounded-xl bg-zinc-50/50 p-4 border border-zinc-100">
                    <div className="flex items-center gap-2 mb-2 flex-wrap select-none">
                      <div className="h-5 w-5 rounded-full bg-zinc-950 text-white flex items-center justify-center flex-shrink-0">
                        <MessageSquareQuote className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-700 tracking-tight">AI Bot Response</span>
                      <Badge variant={review.responseStatus === "posted" ? "success" : "secondary"} className="text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                        {review.responseStatus}
                      </Badge>
                      {review.responseStatus === "posted" && review.respondedBy === "user" && (
                        <span className="text-[10px] text-zinc-400 font-semibold tracking-tight">
                          · ✓ AI drafted & User approved
                        </span>
                      )}
                      {review.responseStatus === "posted" && review.respondedBy === "bot" && (
                        <span className="text-[10px] text-zinc-400 font-semibold tracking-tight">
                          · AI Auto-posted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">{review.responseText}</p>
                  </div>
                )}
                
                {!review.responseText && review.responseStatus === "pending" && (
                  <p className="text-xs text-zinc-400 font-semibold tracking-tight italic">Response drafting in progress...</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
