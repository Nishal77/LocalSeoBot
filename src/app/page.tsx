import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Bot, Star, MapPin, BarChart2, Mail } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">LocalSEOBot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Start free trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 mb-8">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          14-day free trial · No credit card required
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Your local SEO,<br />
          <span className="text-primary">running itself</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Connect your Google Business Profile once. The bot handles posts, citations,
          review responses, and ranking reports — forever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="px-8">
              Start free trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            What the bot does for you
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Weekly GBP Posts",
                description: "AI writes and publishes a Google Business Profile post every week. Seasonal, local, and on-brand.",
              },
              {
                icon: MapPin,
                title: "200+ Citations",
                description: "Submits your business to Yelp, Yellow Pages, Bing Places, and 197 other directories automatically.",
              },
              {
                icon: Star,
                title: "Review Responses",
                description: "Responds to every Google review within 2 hours. Thoughtful, personalized, never generic.",
              },
              {
                icon: BarChart2,
                title: "Keyword Rankings",
                description: "Tracks your position for 20 local keywords every week. See what is moving.",
              },
              {
                icon: Mail,
                title: "Monday Reports",
                description: "Every Monday at 8am, a full summary of everything the bot did that week lands in your inbox.",
              },
              {
                icon: CheckCircle,
                title: "Zero manual work",
                description: "Set it up once. The bot runs forever. No dashboard to check, no tasks to manage.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-muted-foreground mb-10">One plan. Everything included.</p>

          <div className="border rounded-2xl p-8 shadow-sm">
            <div className="text-5xl font-bold mb-1">
              $99<span className="text-xl font-normal text-muted-foreground">/month</span>
            </div>
            <div className="text-muted-foreground mb-6">per location · 14-day free trial</div>

            <ul className="space-y-3 text-left mb-8">
              {[
                "1 GBP post per week (AI-written)",
                "200+ citation directory submissions",
                "Automated review responses (2hr)",
                "Weekly keyword tracking (20 keywords)",
                "Monday morning email reports",
                "Competitor monitoring",
                "No contracts · Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="block">
              <Button size="lg" className="w-full">
                Start 14-day free trial
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              No credit card required to start
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bot className="h-4 w-4" />
          <span className="font-medium">LocalSEOBot</span>
        </div>
        <p>© {new Date().getFullYear()} LocalSEOBot. All rights reserved.</p>
      </footer>
    </div>
  );
}
