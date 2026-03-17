"use client";

import { useUserStats } from "@/hooks/use-user";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  List, 
  Heart, 
  Star, 
  Calendar, 
  Loader2,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const statCards = [
    {
      title: "Total Listings",
      value: stats?.listings_count || 0,
      description: "Active advertisements",
      icon: List,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Wishlist",
      value: stats?.wishlist_count || 0,
      description: "Saved bikes",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      title: "Reviews Given",
      value: stats?.reviews_count || 0,
      description: "Helpful contributions",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Member Since",
      value: stats?.member_since || "...",
      description: "Verified Member",
      icon: Calendar,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stat.title}</p>
              <stat.icon className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
                {statsLoading ? "..." : stat.value}
              </p>
              <p className="text-xs text-zinc-400 font-medium">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col min-h-[340px]">
          <div className="space-y-1 mb-8">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Recent Activity</h3>
            <p className="text-sm text-zinc-400 font-medium">Your latest interactions on MrBikeBD.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
            <p className="text-sm text-zinc-400 font-medium">No recent activity to show.</p>
          </div>
        </div>

        {/* Upgrade Card (Matching Image 3) */}
        <div className="bg-[#FFF7F5] dark:bg-zinc-900/50 rounded-3xl p-8 border border-[#FFEDE8] dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-[#F97316]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Upgrade to Premium</h3>
            </div>
            <p className="text-sm text-zinc-500 font-medium">Get more visibility and sell faster.</p>
            
            <ul className="space-y-4">
              {[
                "Featured Badge on Listings",
                "Priority Support",
                "Extended Ad Duration (30 days)"
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  </div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <Button asChild className="w-full h-14 mt-8 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white shadow-sm transition-all font-bold">
            <Link href="/used-bike/plans">View Plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
