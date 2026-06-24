import type { Metadata } from "next";
import "./globals.css";
import { CrispChat } from "@/components/crisp-chat";

export const metadata: Metadata = {
  title: "RankAgent — AI Local SEO Agent",
  description: "Your AI local SEO agent. Runs GBP posts, citations, review responses, and rankings — 24/7 on autopilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#09090b]">
      <body className="antialiased bg-[#09090b] text-white overscroll-none">
        {children}
        <CrispChat />
      </body>
    </html>
  );
}
