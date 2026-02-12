"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Bike,
  Store,
  Newspaper,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Bell,
  User,
  ArrowLeft,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Official Bikes", href: "/admin/bikes", icon: Bike },
  { name: "Used Bike Ads", href: "/admin/used-bikes", icon: Store },
  { name: "News & Articles", href: "/admin/news", icon: Newspaper },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Close sidebar by default on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Protection logic
  useEffect(() => {
    if (isLoading) return;
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Redirect to home if authenticated but not admin
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, isAuthenticated, router, isLoading]);

  if (isLoading || !isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">
          Checking admin access...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/30 relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-background border-r transition-all duration-300 flex flex-col z-40",
          "fixed md:relative top-16 md:top-0 left-0 bottom-0 h-[calc(100vh-4rem)] md:h-auto",
          isSidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 md:w-20 -translate-x-full md:translate-x-0 overflow-hidden",
        )}
      >
        <div className="p-4 flex items-center justify-between h-14 shrink-0">
          <div className="flex items-center gap-2">
            {isSidebarOpen && (
              <span className="font-bold text-xl">Admin Panel</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "transition-all",
              !isSidebarOpen && !isMobile && "mx-auto",
            )}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !isSidebarOpen && !isMobile && "md:justify-center md:px-2",
                  )}
                  onClick={() => {
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? ""
                        : "text-muted-foreground group-hover:text-accent-foreground",
                    )}
                  />
                  {(isSidebarOpen || isMobile) && (
                    <span className="font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t space-y-2">
          {/* Debug Tools */}
          <Link
            href="/admin/debug"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !isSidebarOpen && !isMobile && "md:justify-center md:px-2",
            )}
            onClick={() => {
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <Bug className="h-5 w-5 shrink-0" />
            {(isSidebarOpen || isMobile) && (
              <span className="font-medium whitespace-nowrap">Debug Tools</span>
            )}
          </Link>

          {/* Settings Link (Moved from Top Nav) */}
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !isSidebarOpen && !isMobile && "md:justify-center md:px-2",
            )}
            onClick={() => {
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {(isSidebarOpen || isMobile) && (
              <span className="font-medium whitespace-nowrap">Settings</span>
            )}
          </Link>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5",
              !isSidebarOpen && !isMobile && "md:px-2 md:justify-center",
            )}
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(isSidebarOpen || isMobile) && (
              <span className="ml-3 font-medium whitespace-nowrap">Logout</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Sub-Header with Toggle */}
        <div className="md:hidden flex items-center p-4 bg-background border-b h-14 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold truncate">
            {adminNav.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h2>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
