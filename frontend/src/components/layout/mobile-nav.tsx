"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Store, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/bikes", icon: Bike, label: "Bikes" },
  { href: "/sell-bike", icon: Plus, label: "Post" },
  { href: "/used-bikes", icon: Store, label: "Used" },
  { href: "/search", icon: Search, label: "Search", action: "search" },
];

// Routes where the mobile nav should be hidden
const HIDDEN_ROUTES = ["/login", "/register"];

export function MobileNav() {
  const pathname = usePathname();
  const { setSearchOpen } = useUIStore();

  // Hide on login/register pages
  if (HIDDEN_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isSearch = item.action === "search";

          if (isSearch) {
            return (
              <button
                key={item.label}
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                  "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          // Post button gets special styling — raised orange circle
          if (item.label === "Post") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl -translate-y-4 transition-transform hover:scale-105">
                  <item.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-primary -mt-3">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-current")}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
