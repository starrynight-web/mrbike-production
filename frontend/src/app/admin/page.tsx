"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Users,
    Bike,
    Store,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Shield,
    Calendar,
    ChevronRight,
    Activity,
    Layers,
    FileText,
    Settings,
    Newspaper,
    LayoutDashboard
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { adminAPI } from "@/lib/admin-api";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export default function AdminDashboard() {
    const pathname = usePathname();
    const { isSuperAdmin, isStaff, staffAdminSections, user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    const isStaffUrl = pathname.startsWith('/staff_admin');
    const baseUrl = isStaffUrl ? '/staff_admin' : '/admin';

    const { data: dashboardData, isLoading: loading } = useQuery({
        queryKey: ["admin", "dashboard"],
        queryFn: async () => {
            const [dashboardStats, pendingListings] = await Promise.all([
                adminAPI.getDashboardStats(),
                (isSuperAdmin || (staffAdminSections || []).includes('staff_used_bikes')) 
                    ? adminAPI.getRecentPending(5) 
                    : Promise.resolve([]),
            ]);

            let totalUsersData = null;
            if (isSuperAdmin) {
                try {
                    totalUsersData = await adminAPI.getTotalUsers();
                } catch (e) {
                    console.error("Failed to load total users data", e);
                }
            }

            const formattedStats = [];
            if (isSuperAdmin && totalUsersData) {
                formattedStats.push({
                    title: "Total Community", value: totalUsersData.total.toLocaleString(),
                    change: `+${totalUsersData.new_week}`, trend: "up", icon: Users,
                    color: "text-blue-500", bg: "bg-blue-500/10", role: 'superadmin'
                });
            }

            if (isSuperAdmin || (staffAdminSections || []).includes('staff_bikes')) {
                formattedStats.push({
                    title: "Catalog Size", value: dashboardStats.total_bikes.toLocaleString(),
                    change: "Verified", trend: "up", icon: Bike,
                    color: "text-orange-500", bg: "bg-orange-500/10", role: 'staff_bikes'
                });
            }

            if (isSuperAdmin || (staffAdminSections || []).includes('staff_used_bikes')) {
                formattedStats.push({
                    title: "Active Ads", value: dashboardStats.active_listings.toLocaleString(),
                    change: `${dashboardStats.pending_approvals || 0} pending`,
                    trend: (dashboardStats.pending_approvals ?? 0) > 0 ? "down" : "up", icon: Store,
                    color: "text-emerald-500", bg: "bg-emerald-500/10", role: 'staff_used_bikes'
                });
            }

            if (isSuperAdmin || (staffAdminSections || []).includes('staff_news')) {
                formattedStats.push({
                    title: "Articles", value: (dashboardStats.published_news || 0).toLocaleString(),
                    change: "Published", trend: "up", icon: FileText,
                    color: "text-purple-500", bg: "bg-purple-500/10", role: 'staff_news'
                });
            }

            return { stats: formattedStats, pendingListings: pendingListings || [] };
        },
        enabled: !authLoading && isStaff,
        staleTime: 5 * 60 * 1000,
    });

    const stats = dashboardData?.stats || [];
    const pendingApprovals = dashboardData?.pendingListings || [];

    const approveMutation = useMutation({
        mutationFn: (id: number) => adminAPI.approveListing(id),
        onSuccess: () => {
            toast.success("Listing approved successfully!");
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
        },
        onError: () => toast.error("Failed to approve listing")
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => adminAPI.rejectListing(id, "Rejected from admin dashboard"),
        onSuccess: () => {
            toast.success("Listing rejected");
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
        },
        onError: () => toast.error("Failed to reject listing")
    });

    const handleApprove = (listingId: number) => approveMutation.mutate(listingId);
    const handleReject = (listingId: number) => rejectMutation.mutate(listingId);

    if (!isStaff && !authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500 text-center px-4">
                <Shield className="h-20 w-20 text-red-500/20 mb-6" />
                <h2 className="text-3xl font-black tracking-tighter uppercase">Access Restricted</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    This sector is restricted to administrative personnel. Your credentials do not grant access to the control center.
                </p>
                <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="rounded-xl px-8" asChild>
                        <Link href="/">Home</Link>
                    </Button>
                    <Button className="rounded-xl px-8" asChild>
                        <Link href="/login">Re-authenticate</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold py-0 bg-primary/5 border-primary/20">
                            {isStaffUrl ? "Staff Member" : "Super Admin"}
                        </Badge>
                        <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Control Center</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                        Portal Overview
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back, <span className="text-zinc-900 dark:text-zinc-100 font-bold">{user?.name?.split(' ')[0]}</span>. System status is currently <span className="text-emerald-500 font-bold uppercase text-[10px]">Optimal</span>.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                     <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm" size="sm">
                        <Calendar className="h-4 w-4 mr-2" /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                     </Button>
                     <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] })} disabled={loading} size="sm" className="rounded-xl shadow-lg shadow-black/5 dark:shadow-white/5">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                        Refresh
                     </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {loading && stats.length === 0 ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50" />
                    ))
                ) : (
                    <div className="contents">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl -z-10 group-hover:shadow-xl transition-all duration-500 border border-zinc-100 dark:border-zinc-800" />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn("p-2.5 rounded-2xl", stat.bg)}>
                                            <stat.icon className={cn("h-5 w-5", stat.color)} />
                                        </div>
                                        <div className={cn(
                                            "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                            stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                        )}>
                                            {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">{stat.title}</h3>
                                        <p className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                                            {stat.value}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn("absolute bottom-0 left-6 right-6 h-1 rounded-t-full transition-all group-hover:h-1.5", stat.bg?.replace('/10', ''))} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
                {/* Pending Moderation */}
                {(isSuperAdmin || (staffAdminSections || []).includes('staff_used_bikes')) ? (
                    <Card className="lg:col-span-4 border-none shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tighter">
                                    <Clock className="h-5 w-5 text-zinc-400" />
                                    Active Tasks
                                </CardTitle>
                                <CardDescription className="text-xs font-medium uppercase tracking-wider">Moderation Queue</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl font-bold h-9 bg-zinc-100 dark:bg-zinc-800" asChild>
                                <Link href={`${baseUrl}/used-bikes`}>Manage All <ChevronRight className="h-4 w-4 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            {loading ? (
                                <div className="space-y-4 pt-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-10 w-10 rounded-xl" />
                                                <Skeleton className="h-10 w-24 rounded-xl" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : pendingApprovals.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-500/5 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold">Queue is empty</p>
                                        <p className="text-xs text-muted-foreground">All recent listings have been processed.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4">
                                    {pendingApprovals.map((item, idx) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 relative overflow-hidden shrink-0">
                                                    {item.image_url ? (
                                                        <Image
                                                            src={item.image_url}
                                                            alt={item.bike_model}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <Bike className="h-6 w-6 text-zinc-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tighter">
                                                        {item.bike_model} <span className="text-zinc-400 ml-1">#{item.id}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                       <Badge variant="outline" className="text-[9px] h-4 py-0 font-bold bg-zinc-50 dark:bg-zinc-800">{item.year}</Badge>
                                                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">৳{Number(item.price).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <TooltipProvider>
                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-10 w-10 min-w-10 rounded-xl text-rose-500 border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                                onClick={() => handleReject(item.id)}
                                                                disabled={rejectMutation.isPending && rejectMutation.variables === item.id}
                                                            >
                                                                {rejectMutation.isPending && rejectMutation.variables === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Reject Listing</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                className="h-10 rounded-xl px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
                                                                onClick={() => handleApprove(item.id)}
                                                                disabled={approveMutation.isPending && approveMutation.variables === item.id}
                                                            >
                                                                {approveMutation.isPending && approveMutation.variables === item.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                )}
                                                                Approve
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Approve Listing</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                   <Card className="lg:col-span-4 border-none shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                        <Lock className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mb-4" />
                        <h3 className="font-black text-lg uppercase tracking-tighter">Moderation Restricted</h3>
                        <p className="text-sm text-zinc-400 max-w-xs mt-2 font-medium leading-relaxed">
                            You don't have the "used_bikes" clearance required to view this moderation queue.
                        </p>
                   </Card>
                )}

                {/* System Nodes */}
                <Card className={cn(
                    "border-none shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl overflow-hidden",
                    "lg:col-span-3"
                )}>
                    <CardHeader className="px-8 pt-8">
                        <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tighter">
                            <Layers className="h-5 w-5 text-zinc-400" />
                            System Pulse
                        </CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">Health & Connectivity</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        {[
                            { name: "REST API", label: "Django Service Layer", status: "Operational", color: "bg-emerald-500" },
                            { name: "Database", label: "PostgreSQL Engine", status: "Healthy", color: "bg-emerald-500" },
                            { name: "Media CDN", label: "Cloudinary Gateway", status: "Optimal", color: "bg-emerald-500" },
                            { name: "Auth Cluster", label: "Verified sessions", status: "Healthy", color: "bg-emerald-500" },
                        ].map((node, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-200">{node.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">{node.label}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold text-zinc-500 uppercase">{node.status}</span>
                                     <span className={cn("h-2 w-2 rounded-full animate-pulse", node.color)} />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4">
                            <div className="p-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <h4 className="text-sm font-bold uppercase tracking-tighter">Security v4.2</h4>
                                </div>
                                <p className="text-[11px] opacity-70 leading-relaxed font-medium">
                                    Your session is authenticated and monitored. Actions are logged against your profile.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Quick Access Grid (For staff with specific roles) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Catalog", desc: "Official database", href: `${baseUrl}/bikes`, icon: Bike, role: 'staff_bikes' },
                    { title: "Used Ads", desc: "Marketplace moderation", href: `${baseUrl}/used-bikes`, icon: Store, role: 'staff_used_bikes' },
                    { title: "Newsroom", desc: "Articles & Updates", href: `${baseUrl}/news`, icon: Newspaper, role: 'staff_news' },
                    { title: "Admin", desc: "Staff & Settings", href: `${baseUrl}/staff`, icon: LayoutDashboard, role: 'superadmin' },
                ].filter(item => isSuperAdmin || (staffAdminSections || []).includes(item.role)).map((item, i) => (
                    <Link key={i} href={item.href} className="group">
                        <div className="p-6 h-full rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 group-hover:scale-95 transition-transform">
                                    <item.icon className="h-6 w-6 text-zinc-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-black uppercase tracking-widest">{item.title}</h4>
                                    <p className="text-xs text-zinc-400 font-medium">{item.desc}</p>
                                </div>
                             </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
