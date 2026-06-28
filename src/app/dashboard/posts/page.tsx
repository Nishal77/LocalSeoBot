import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PostActions } from "@/components/dashboard/post-actions";
import { AlertCircle, Calendar, Sparkles } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
  published: "success",
  draft: "secondary",
  pending_approval: "warning",
  failed: "destructive",
};

export default async function PostsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });
  if (!business) redirect("/onboarding");

  const realPosts = await prisma.gbpPost.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Sample data fallback if no posts are generated yet
  const isDemo = realPosts.length === 0;
  const posts = isDemo
    ? [
        {
          id: "demo-post-1",
          status: "published",
          postType: "What's New",
          content: "We are thrilled to be recognized as the #1 local service provider in town! Huge thanks to our incredible customers for the constant support and 5-star reviews. Call us today for a free custom consultation!",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-post-2",
          status: "pending_approval",
          postType: "Offer",
          content: "Looking to upgrade your local setup? Get 15% off any service starting next Monday. Tap the button below to reserve your slot before they fill up!",
          createdAt: new Date(),
          publishedAt: null,
        },
        {
          id: "demo-post-3",
          status: "published",
          postType: "Event",
          content: "Join us for our local business open house workshop this Saturday! Meet the team, enjoy refreshments, and learn the best practices for optimizing your business operations.",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ]
    : realPosts;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">GBP Posts</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Review, approve, and manage autopilot Google Business Profile updates.
        </p>
      </div>

      {/* Demo Sandbox Alert */}
      {isDemo && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Sandbox Mode</span>
            <p className="text-amber-700/90 mt-0.5 font-medium leading-relaxed">
              No live Google posts generated yet. Showing mock post recommendations created by the AI agent based on your business setup.
            </p>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-5">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              {/* Card Meta Header */}
              <div className="flex items-center justify-between border-b border-zinc-50 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[post.status] ?? "secondary"} className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                    {post.status.replace("_", " ")}
                  </Badge>
                  {post.postType && (
                    <Badge variant="outline" className="text-zinc-500 border-zinc-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {post.postType}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(post.createdAt, "MMM d, yyyy")}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>
                
                {post.publishedAt && (
                  <p className="text-xs text-zinc-400 font-semibold tracking-tight">
                    Published {format(post.publishedAt, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}

                {post.status === "pending_approval" && (
                  <div className="pt-2 border-t border-zinc-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                      <Sparkles className="h-4 w-4" />
                      Pending your approval before publication
                    </div>
                    <PostActions postId={post.id} content={post.content} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
