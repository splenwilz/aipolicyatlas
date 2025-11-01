/**
 * Sidebar Navigation Component
 * 
 * Left-side navigation sidebar matching the reference design.
 * Includes navigation links and access portal section.
 * 
 * Reference: Inspired by Web Prodigies sidebar layout
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  TrendingUp,
  Star,
  BookOpen,
  Users,
  Settings,
  LogIn,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Navigation items configuration
 */
const navigationItems = [
  {
    title: "Platform",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Search", href: "/search", icon: Search },
      { label: "Trending", href: "/trending", icon: TrendingUp },
      { label: "Top Policies", href: "/top", icon: Star },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Documentation", href: "/docs", icon: BookOpen },
      { label: "Community", href: "/community", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/**
 * Sidebar Component
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[oklch(0.08_0.01_260)] border-r border-[oklch(0.2_0.05_270_/_0.5)] flex flex-col z-10 max-lg:hidden">
      {/* Logo Section */}
      <div className="p-6 border-b border-[oklch(0.2_0.05_270_/_0.5)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">AI Policy</h2>
            <p className="text-xs text-[oklch(0.6_0.02_270)]">Atlas</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-[oklch(0.5_0.02_270)] uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-[oklch(0.25_0.08_280_/_0.3)] text-cyan-300 border border-cyan-500/20"
                          : "text-[oklch(0.7_0.02_270)] hover:bg-[oklch(0.15_0.03_270_/_0.3)] hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Access Portal Section */}
      <div className="p-4 border-t border-[oklch(0.2_0.05_270_/_0.5)] space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Access Your Portal</h3>
          <p className="text-xs text-[oklch(0.6_0.02_270)]">
            Join AI Policy Atlas and access premium features.
          </p>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          size="sm"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>

        <div className="space-y-2 text-xs text-[oklch(0.6_0.02_270)]">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>Unlimited policies</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>Advanced search</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>Premium collections</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
