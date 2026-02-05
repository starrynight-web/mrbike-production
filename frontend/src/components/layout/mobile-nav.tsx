"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search", action: "search" },
    { href: "/sell-bike", icon: PlusCircle, label: "Post" },
    { href: "/used-bikes", icon: Store, label: "Used" },
    { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
    const pathname = usePathname();
    const { setSearchOpen } = useUIStore();

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
                                    "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    }

                    // Post button gets special styling
                    if (item.label === "Post") {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-4">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-medium text-primary -mt-2">
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
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
