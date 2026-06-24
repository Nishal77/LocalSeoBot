import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CrispChat } from "@/components/crisp-chat";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        {children}
        <CrispChat />
      </body>
    </html>
  );
}
