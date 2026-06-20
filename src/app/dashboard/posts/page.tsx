import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PostActions } from "@/components/dashboard/post-actions";

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

  const posts = await prisma.gbpPost.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">GBP Posts</h1>
          <p className="text-muted-foreground mt-1">All Google Business Profile posts</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts yet. The bot generates a post every Monday.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[post.status] ?? "secondary"}>
                      {post.status.replace("_", " ")}
                    </Badge>
                    {post.postType && (
                      <Badge variant="outline">{post.postType}</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(post.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                {post.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    Published {format(post.publishedAt, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
                {post.status === "pending_approval" && (
                  <PostActions postId={post.id} content={post.content} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
