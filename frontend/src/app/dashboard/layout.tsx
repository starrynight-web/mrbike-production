"use client";

import { useAuthStore } from "@/store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, 
  Bike, 
  Heart, 
  Star, 
  Bell, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle2,
  Loader2,
  PlusCircle,
  User,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-listings", label: "My Listings", icon: Bike },
  { href: "/dashboard/wishlist", label: "Wishlist (0)", icon: Heart },
  { href: "/dashboard/favorites", label: "Favorites (1)", icon: Star },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/my-reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/shop", label: "My Shop", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading: authLoading } = useAuthStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#09090B]">
      <div className="container max-w-6xl py-12 space-y-8 mx-auto">
        {/* Profile Card & Header (Matching Image 3) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row gap-10 items-center justify-between relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border border-zinc-100 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="text-3xl bg-zinc-50 text-zinc-300 font-normal">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <p className="text-sm font-medium text-zinc-500 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-4 w-4" /> {user.email || "01711111111@mrbikebd.com"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none h-12 px-6 rounded-xl border-[#FEE2E2] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
              <Button asChild className="flex-1 md:flex-none h-12 px-8 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white shadow-sm transition-all font-bold">
                <Link href="/sell-bike">
                  <PlusCircle className="mr-2 h-4 w-4" /> Post Ad
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs (Matching Image 3) */}
        <div className="bg-[#FAF9F6] dark:bg-zinc-900/50 rounded-2xl p-1.5 border border-zinc-100 dark:border-zinc-800">
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all",
                  pathname === item.href 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700 font-bold" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
