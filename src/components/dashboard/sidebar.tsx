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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/dashboard/citations", label: "Citations", icon: MapPin },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/rankings", label: "Rankings", icon: BarChart2 },
  { href: "/dashboard/reports", label: "Reports", icon: Mail },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface Props {
  businessName: string;
  businessId: string;
  hasGBP: boolean;
  status: string;
  trialEndsAt: string | null;
}

export function DashboardSidebar({ businessName, hasGBP, status, trialEndsAt }: Props) {
  const pathname = usePathname();

  const daysLeft = trialEndsAt
    ? differenceInDays(new Date(trialEndsAt), new Date())
    : null;

  const isTrialing = status === "active" && daysLeft !== null && daysLeft >= 0;

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LocalSEOBot</span>
        </div>
        <div className="mt-2 text-sm font-medium text-muted-foreground truncate">
          {businessName}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <div className={cn(
            "h-2 w-2 rounded-full",
            status === "active" ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {status === "active" ? "Bot running" : "Paused"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {(!hasGBP || isTrialing) && (
        <div className="px-3 pt-3 space-y-2">
          {!hasGBP && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>Connect Google to unlock full automation</span>
            </div>
          )}
          {isTrialing && daysLeft !== null && daysLeft <= 3 && (
            <div className="flex items-start gap-2 rounded-md bg-orange-50 p-2 text-xs text-orange-800">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>Trial ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
