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
    Loader
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminAPI } from "@/lib/admin-api";

export default function AdminDashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardStats, pendingListings] = await Promise.all([
                adminAPI.getDashboardStats(),
                adminAPI.getRecentPending(5),
            ]);

            // Transform stats for display
            const formattedStats = [
                {
                    title: "Total Users",
                    value: dashboardStats.total_users.toLocaleString(),
                    change: `${dashboardStats.user_change > 0 ? '+' : ''}${dashboardStats.user_change}%`,
                    trend: dashboardStats.user_change > 0 ? "up" : "down",
                    icon: Users,
                },
                {
                    title: "Official Bikes",
                    value: dashboardStats.total_bikes.toLocaleString(),
                    change: `${dashboardStats.bikes_change > 0 ? '+' : ''}${dashboardStats.bikes_change}`,
                    trend: dashboardStats.bikes_change > 0 ? "up" : "down",
                    icon: Bike,
                },
                {
                    title: "Active Used Ads",
                    value: dashboardStats.active_listings.toLocaleString(),
                    change: `${dashboardStats.listings_change > 0 ? '+' : ''}${dashboardStats.listings_change}`,
                    trend: dashboardStats.listings_change > 0 ? "up" : "down",
                    icon: Store,
                },
                {
                    title: "Monthly Traffic",
                    value: `${(dashboardStats.monthly_traffic / 1000).toFixed(1)}k`,
                    change: `${dashboardStats.traffic_change > 0 ? '+' : ''}${dashboardStats.traffic_change}%`,
                    trend: dashboardStats.traffic_change > 0 ? "up" : "down",
                    icon: TrendingUp,
                },
            ];

            setStats(formattedStats);
            setPendingApprovals(pendingListings);
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (listingId: number) => {
        try {
            setApprovingId(listingId);
            await adminAPI.approveListing(listingId);
            toast.success("Listing approved successfully!");
            setPendingApprovals(pendingApprovals.filter(p => p.id !== listingId));
            await loadDashboardData();
        } catch (error) {
            console.error("Failed to approve listing:", error);
            toast.error("Failed to approve listing");
        } finally {
            setApprovingId(null);
        }
    };

    const handleReject = async (listingId: number) => {
        try {
            setRejectingId(listingId);
            await adminAPI.rejectListing(listingId, "Rejected from admin dashboard");
            toast.success("Listing rejected");
            setPendingApprovals(pendingApprovals.filter(p => p.id !== listingId));
            await loadDashboardData();
        } catch (error) {
            console.error("Failed to reject listing:", error);
            toast.error("Failed to reject listing");
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with MrBikeBD today.</p>
            </div>

            {/* Stats Grid */}
            {loading && stats.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="flex items-center text-xs mt-1">
                                        <span className={cn(
                                            "flex items-center font-medium mr-1",
                                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                                        )}>
                                            {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                            {stat.change}
                                        </span>
                                        <span className="text-muted-foreground">from last week</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Pending Moderation */}
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pending Moderation</CardTitle>
                            <CardDescription>Recently submitted used bike ads requiring review.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/admin/used-bikes">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingApprovals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bike className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No pending listings</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingApprovals.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/40 border-none transition-colors hover:bg-muted/60">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded bg-background flex items-center justify-center border relative overflow-hidden">
                                                {item.image_url ? (
                                                    <Image 
                                                        src={item.image_url} 
                                                        alt={item.bike_model} 
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <Bike className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold leading-none">{item.bike_model} ({item.year})</p>
                                                <p className="text-sm text-muted-foreground mt-1">by {item.seller_name} • ৳{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            <span className="text-xs text-muted-foreground mr-2 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleReject(item.id)}
                                                disabled={rejectingId === item.id}
                                            >
                                                {rejectingId === item.id ? <Loader className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(item.id)}
                                                disabled={approvingId === item.id}
                                            >
                                                {approvingId === item.id ? (
                                                    <Loader className="h-4 w-4 mr-1.5 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                                )}
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                        <CardDescription>Real-time platform health status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Django Backend</p>
                                <p className="text-xs text-muted-foreground">API service performance</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">PostgreSQL</p>
                                <p className="text-xs text-muted-foreground">Primary user database</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Cloudinary Cache</p>
                                <p className="text-xs text-muted-foreground">Image delivery network</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Fast (24ms)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">NextAuth Sessions</p>
                                <p className="text-xs text-muted-foreground">Authentication provider</p>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">2 Warnings</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
