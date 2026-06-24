import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { Stats } from "@/components/landing/Stats";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { VsAgency } from "@/components/landing/VsAgency";
import { TrustSignals } from "@/components/landing/TrustSignals";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

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
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      <Navbar />
      
      {/* Vertical bordered container for Hero section only */}
      <div className="max-w-6xl mx-auto border-x border-zinc-800 bg-[#09090b]">
        <HeroSection />
      </div>

      {/* Other sections outside the layout borders */}
      <Stats stats={stats} />
      <TrustBar />
      <Features />
      <HowItWorks />
      <VsAgency />
      <TrustSignals />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
