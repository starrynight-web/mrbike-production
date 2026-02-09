"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Bike,
    Store,
    Newspaper,
    Users,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Bell,
    User,
    ArrowLeft
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
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Protection logic (Mock)
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
    }, [user, isAuthenticated, router]);

    if (isLoading || !isAuthenticated || !user || user.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground font-medium">Checking admin access...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-muted/30">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-background border-r transition-all duration-300 flex flex-col z-50",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="p-4 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <Link href="/admin" className="font-bold text-xl tracking-tighter">
                            MrBike<span className="text-primary">BD</span> <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">ADMIN</span>
                        </Link>
                    ) : (
                        <div className="bg-primary h-8 w-8 rounded flex items-center justify-center mx-auto">
                            <Bike className="h-5 w-5 text-primary-foreground" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "" : "text-muted-foreground group-hover:text-accent-foreground")} />
                                    {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5", !isSidebarOpen && "px-0 justify-center")}
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-background border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" /> View Site
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background"></span>
                        </Button>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none">{user.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center border shadow-sm overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
