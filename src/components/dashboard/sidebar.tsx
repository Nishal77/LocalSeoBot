"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Star,
  BarChart2,
  Mail,
  Settings,
  LogOut,
  Bot,
  AlertCircle,
  Image as ImageIcon,
  Send,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

const GROUPS = [
  {
    title: "Getting Started",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    title: "Autopilot Engine",
    items: [
      { href: "/dashboard/posts", label: "Weekly Posts", icon: FileText },
      { href: "/dashboard/photos", label: "Media Gallery", icon: ImageIcon },
      { href: "/dashboard/citations", label: "Citation Builder", icon: MapPin },
      { href: "/dashboard/reviews", label: "Review Responder", icon: Star },
      { href: "/dashboard/reviews/campaign", label: "SMS Campaigns", icon: Send },
    ],
  },
  {
    title: "Performance Logs",
    items: [
      { href: "/dashboard/rankings", label: "Keyword Rankings", icon: BarChart2 },
      { href: "/dashboard/reports", label: "Weekly Reports", icon: Mail },
    ],
  },
];

interface Props {
  businessName: string;
  businessId: string;
  hasGBP: boolean;
  status: string;
  trialEndsAt: string | null;
  userRole: string;
  userEmail: string;
}

export function DashboardSidebar({ businessName, hasGBP, status, trialEndsAt, userRole, userEmail }: Props) {
  const pathname = usePathname();

  const daysLeft = trialEndsAt
    ? differenceInDays(new Date(trialEndsAt), new Date())
    : null;

  const isTrialing = status === "active" && daysLeft !== null && daysLeft >= 0;

  const isAdmin =
    userRole === "admin" ||
    userEmail === "admin@localseobot.com" ||
    userEmail.startsWith("admin@");

  const groups = [...GROUPS];
  if (isAdmin) {
    groups.push({
      title: "Operations",
      items: [
        { href: "/dashboard/admin", label: "Admin Console", icon: ShieldAlert },
      ],
    });
  }

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full select-none">
      {/* Premium Logo Header matching the template image */}
      <div className="flex items-center gap-3 p-5 border-b border-zinc-100">
        <div className="h-10 w-10 bg-[#09090b] rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <Bot className="h-5.5 w-5.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-zinc-950 text-sm tracking-tight truncate leading-tight">RankAgent</span>
          <span className="text-[11px] text-zinc-400 font-semibold tracking-tight mt-0.5">v1.0.0</span>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {(!hasGBP || isTrialing) && (
        <div className="px-3 pt-3 space-y-2">
          {!hasGBP && (
            <div className="flex items-start gap-2 rounded-xl bg-yellow-50/50 border border-yellow-200/50 p-2.5 text-xs text-yellow-800 leading-normal font-medium">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-yellow-600" />
              <span>Connect Google Business Profile to start automating.</span>
            </div>
          )}
          {isTrialing && daysLeft !== null && daysLeft <= 3 && (
            <div className="flex items-start gap-2 rounded-xl bg-orange-50/50 border border-orange-200/50 p-2.5 text-xs text-orange-800 leading-normal font-medium">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-orange-600" />
              <span>Trial ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}.</span>
            </div>
          )}
        </div>
      )}

      {/* Grouped Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {/* Header styled like the reference image */}
            <div className="text-[13px] font-semibold text-zinc-950 px-3 py-1 tracking-tight select-none">
              {group.title}
            </div>

            {/* Links */}
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-tight transition duration-150",
                      active
                        ? "bg-zinc-100/80 text-zinc-950"
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition duration-150",
                        active ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-500"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Sign Out */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/40">
        <div className="px-3 py-1.5 mb-2 truncate">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Workspace</div>
          <div className="text-xs text-zinc-700 font-semibold truncate mt-0.5">{businessName}</div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition duration-150"
        >
          <LogOut className="h-4 w-4 text-zinc-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
