import type { Metadata } from "next";
import "./globals.css";
import { CrispChat } from "@/components/crisp-chat";
import { Providers } from "@/components/providers";

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
    <html lang="en">
      <body className="antialiased text-zinc-900 bg-white overscroll-none">
        <Providers>{children}</Providers>
        <CrispChat />
      </body>
    </html>
  );
}
