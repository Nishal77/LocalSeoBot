import { Bot, Globe, MessageSquare, BarChart2, Mail, Zap } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 mb-4 uppercase tracking-widest">What your agent does</div>
          <h2 className="text-4xl font-black text-white mb-4">Everything a $1,500/mo SEO agency does.<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Automated. For $99.</span>
          </h2>
          <p className="text-zinc-500 text-lg">Your agent works 24/7 so you never have to think about local SEO again.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Bot,
              color: "from-violet-600/20 to-violet-600/5",
              border: "border-violet-500/20",
              iconColor: "text-violet-400",
              iconBg: "bg-violet-500/20",
              badge: "Every Monday",
              badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
              title: "AI-Written GBP Posts",
              desc: "150-250 word post every Monday. Seasonal, local, written in your voice. Auto-published or sent to you first.",
            },
            {
              icon: Globe,
              color: "from-blue-600/20 to-blue-600/5",
              border: "border-blue-500/20",
              iconColor: "text-blue-400",
              iconBg: "bg-blue-500/20",
              badge: "Daily",
              badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              title: "200+ Citation Submissions",
              desc: "Yelp, Yellow Pages, Bing Places and 197 more. Submitted and tracked. NAP consistency verified monthly.",
            },
            {
              icon: MessageSquare,
              color: "from-emerald-600/20 to-emerald-600/5",
              border: "border-emerald-500/20",
              iconColor: "text-emerald-400",
              iconBg: "bg-emerald-500/20",
              badge: "Within 2 hours",
              badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              title: "AI Review Responses",
              desc: "Every Google review gets a personal AI-written response in under 2 hours. Reads the actual review. Sounds like you.",
            },
            {
              icon: BarChart2,
              color: "from-yellow-600/20 to-yellow-600/5",
              border: "border-yellow-500/20",
              iconColor: "text-yellow-400",
              iconBg: "bg-yellow-500/20",
              badge: "Weekly",
              badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
              title: "Keyword Rank Tracking",
              desc: "20 local keywords tracked every week. Map pack + organic positions. See what moved and who's beating you.",
            },
            {
              icon: Mail,
              color: "from-pink-600/20 to-pink-600/5",
              border: "border-pink-500/20",
              iconColor: "text-pink-400",
              iconBg: "bg-pink-500/20",
              badge: "Every Monday 8am",
              badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
              title: "Monday Morning Report",
              desc: "One email every Monday at 8am. Posts published, reviews replied, citations added, rankings moved. Nothing to log in for.",
            },
            {
              icon: Zap,
              color: "from-cyan-600/20 to-cyan-600/5",
              border: "border-cyan-500/20",
              iconColor: "text-cyan-400",
              iconBg: "bg-cyan-500/20",
              badge: "Always on",
              badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
              title: "Zero Manual Work",
              desc: "No dashboard to check daily. No tasks to manage. No agency to chase. Connect once — AI runs everything forever.",
            },
          ].map((f) => (
            <div key={f.title} className={`group relative rounded-2xl border ${f.border} bg-gradient-to-b ${f.color} p-6 hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${f.badgeColor}`}>{f.badge}</span>
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
