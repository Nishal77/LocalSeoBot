import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { AutopilotCallout } from "@/components/landing/AutopilotCallout";
import { Flip } from "@/components/landing/Flip";
import { Benefits } from "@/components/landing/Benefits";
import { VsCompetitors } from "@/components/landing/VsCompetitors";
import { WhatToExpect } from "@/components/landing/WhatToExpect";
import { Results } from "@/components/landing/Results";
import { LiveFeed } from "@/components/landing/LiveFeed";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustSignals } from "@/components/landing/TrustSignals";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      <Navbar />

      {/* Vertical bordered container for Hero, Problem, AutopilotCallout and Flip sections */}
      <div className="max-w-6xl mx-auto border-x border-t border-b border-zinc-800 bg-[#09090b] mt-20">
        <Hero />
        <Problem />
        <AutopilotCallout />
        <Flip />
      </div>

      {/* Other sections outside the layout borders */}
      <HowItWorks />
      <Benefits />
      <VsCompetitors />
      <WhatToExpect />
      <LiveFeed />
      <Pricing />
      <TrustSignals />
      <Results />




      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
