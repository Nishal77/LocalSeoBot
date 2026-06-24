import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Bot, Star, MapPin, BarChart2, Mail,
  Shield, Clock, TrendingUp, ArrowRight, Zap
} from "lucide-react";

async function getPlatformStats() {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/public/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<{
      businessCount: number;
      citationsLive: number;
      reviewsResponded: number;
      postsPublished: number;
    }>;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  const stats = await getPlatformStats();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">RankAgent</span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-blue-600 text-white tracking-wide">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700">Start free trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm text-blue-700 mb-8">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          14-day free trial · No credit card required to start
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
          AI Agent · Runs 24/7 · No manual work
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900">
          Your AI local SEO agent,<br />
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">running 24/7</span>
        </h1>
        <p className="text-xl text-gray-500 mb-4 max-w-2xl mx-auto leading-relaxed">
          Connect your Google Business Profile once. Your AI agent writes posts, builds citations,
          responds to reviews, and sends you a report — every single week, forever.
        </p>
        <p className="text-base text-gray-400 mb-10">
          Local agencies charge $500–$2,000/month for this. RankAgent charges $99.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link href="/signup">
            <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-base h-12">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 text-base h-12">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400">
          Setup takes 5 minutes. AI agent starts immediately. You review everything before it posts.
        </p>
      </section>

      {/* Live platform stats — real numbers from DB */}
      {stats && stats.businessCount > 0 && (
        <section className="py-12 bg-blue-600">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: stats.businessCount.toLocaleString(), label: "Businesses running" },
                { value: stats.citationsLive.toLocaleString(), label: "Citations live" },
                { value: stats.reviewsResponded.toLocaleString(), label: "Reviews responded" },
                { value: stats.postsPublished.toLocaleString(), label: "GBP posts published" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-blue-200 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust signals */}
      <section className="py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "You approve before anything posts",
                desc: "Turn on approval mode and every post and review response comes to your inbox first. Nothing goes live without your say.",
              },
              {
                icon: Clock,
                title: "Reviews answered in under 2 hours",
                desc: "Google rewards businesses that respond quickly. Most owners take days. Your bot responds while you're with a customer.",
              },
              {
                icon: TrendingUp,
                title: "Same work agencies charge $1,500/mo for",
                desc: "Weekly GBP posts, 200+ citation submissions, review management, rank tracking. Agencies do this manually. We automate it.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three steps. Then the bot handles everything.</p>
          </div>
          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Connect your Google Business Profile",
                desc: "One OAuth click. Takes 30 seconds. We get access to post, reply to reviews, and read your profile data.",
                time: "30 seconds",
              },
              {
                step: "02",
                title: "Bot runs an instant audit",
                desc: "We scan your GBP completeness, check your current rankings, and identify what's hurting your visibility. You see the results immediately.",
                time: "60 seconds",
              },
              {
                step: "03",
                title: "Start your trial — bot runs forever",
                desc: "Weekly posts go live every Monday. Reviews get responses within 2 hours. Citations submit daily. You get a report every Monday at 8am. You do nothing.",
                time: "Ongoing",
              },
            ].map(({ step, title, desc, time }) => (
              <div key={step} className="flex gap-6 p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className="flex-shrink-0 text-3xl font-bold text-blue-100">{step}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">{time}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What your AI agent does every week</h2>
            <p className="text-gray-500">Everything a local SEO agency does. AI-automated. For $99/month.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "AI-Written GBP Posts",
                description: "Your agent writes a 150-250 word post every Monday. Seasonal, local, relevant. Published automatically — or sent to you for approval first.",
                badge: "Every Monday",
              },
              {
                icon: MapPin,
                title: "200+ Citation Submissions",
                description: "Yelp, Yellow Pages, Bing Places, and 197 more directories. Submitted automatically. We track which ones go live and verify your NAP matches.",
                badge: "Daily",
              },
              {
                icon: Star,
                title: "AI Review Responses",
                description: "Every new Google review gets a personal AI-written response within 2 hours. Reads the actual review. Sounds like you wrote it.",
                badge: "Within 2 hours",
              },
              {
                icon: BarChart2,
                title: "Keyword Rank Tracking",
                description: "20 local keywords tracked weekly. Map pack position + organic. See what moved up, what dropped, and who's ranking above you.",
                badge: "Every Monday",
              },
              {
                icon: Mail,
                title: "Monday Morning Report",
                description: "Every Monday at 8am: post published, reviews replied, citations added, rankings moved. One email. Everything in one place.",
                badge: "Every Monday 8am",
              },
              {
                icon: Zap,
                title: "Zero Manual Work",
                description: "No dashboard to check. No tasks to approve (unless you want to). No agency to manage. Connect once — bot runs forever.",
                badge: "Always on",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{feature.badge}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* vs Agency comparison */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">vs. hiring an SEO agency</h2>
            <p className="text-gray-500">Same deliverables. 94% less cost. Faster.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-gray-600 font-semibold">What you get</th>
                  <th className="px-6 py-4 text-gray-600 font-semibold text-center">Local Agency</th>
                  <th className="px-6 py-4 text-blue-600 font-semibold text-center bg-blue-50">RankAgent AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Weekly GBP posts", "Sometimes", "✅ Every Monday"],
                  ["Citation submissions (200+)", "✅ One-time setup", "✅ Ongoing + verified"],
                  ["Review responses", "❌ Extra charge", "✅ Within 2 hours"],
                  ["Keyword rank tracking", "✅ Monthly report", "✅ Weekly"],
                  ["Review approval control", "❌ None", "✅ You approve first"],
                  ["Responds at 2am", "❌ No", "✅ Yes"],
                  ["Monthly cost", "$500–$2,000", "$99 · RankAgent AI"],
                ].map(([feature, agency, ours]) => (
                  <tr key={String(feature)} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 text-gray-700 font-medium">{feature}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{agency}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900 bg-blue-50/50">{ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-gray-500 mb-10">One plan. Everything included. Cancel anytime.</p>
          <div className="border border-blue-200 rounded-2xl p-8 shadow-lg bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
              MOST POPULAR
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-1">
              $99<span className="text-xl font-normal text-gray-400">/month</span>
            </div>
            <div className="text-gray-500 mb-8">per location · 14-day free trial</div>
            <ul className="space-y-3 text-left mb-8">
              {[
                "1 AI-written GBP post every week",
                "200+ citation directory submissions",
                "Automated review responses (within 2 hours)",
                "Weekly keyword tracking (20 keywords)",
                "Monday morning email report",
                "Competitor monitoring (5 competitors)",
                "Post + review approval emails (optional)",
                "No contracts · Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
                Start 14-day free trial
              </Button>
            </Link>
            <p className="text-xs text-gray-400 mt-3">No credit card required to start</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-violet-700 to-blue-700">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Your competitors are on Google Maps. Your AI agent isn&apos;t.</h2>
          <p className="text-blue-200 mb-8 text-lg">Setup takes 5 minutes. AI agent starts ranking you within 24 hours.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-base font-semibold">
              Start free trial — no card needed
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">RankAgent</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-blue-600 text-white">AI</span>
            <span className="text-gray-400 text-sm ml-1">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-900">Get started</Link>
            <Link href="/dashboard/settings" className="hover:text-gray-900">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
