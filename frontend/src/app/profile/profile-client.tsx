"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Heart,
    List,
    Settings,
    LogOut,
    Bike,
    Calendar,
    Mail,
    Star,
    CreditCard,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useWishlistStore } from "@/store";
import { useUserStats } from "@/hooks/use-user";
import { toast } from "sonner";

export function ProfileClient() {
    const router = useRouter();
    const { user, logout, login } = useAuthStore();
    const { bikeIds } = useWishlistStore();
    const { data: stats, isLoading: statsLoading } = useUserStats();
    const [activeTab, setActiveTab] = useState("overview");
    const [isSaving, setIsSaving] = useState(false);

    // Settings Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                location: user.location || ""
            });
        }
    }, [user]);

    // Redirect if not logged in
    if (!user) {
        router.push("/login");
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h2 className="text-2xl font-bold">Checking Authentication...</h2>
                <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/");
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local user state
        login({
            ...user,
            ...formData
        });

        setIsSaving(false);
        toast.success("Profile updated successfully");
    };

    return (
        <div className="container py-10 space-y-8 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xl">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center text-muted-foreground gap-1 sm:gap-3 text-sm">
                            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                            {formData.location && <span className="hidden sm:inline">•</span>}
                            {formData.location && <span>{formData.location}</span>}
                            {user.phoneVerified && (
                                <Badge variant="secondary" className="ml-0 sm:ml-2 w-fit bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                    <Button asChild>
                        <Link href="/sell-bike">
                            <Bike className="mr-2 h-4 w-4" /> Post Ad
                        </Link>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg no-scrollbar">
                    <TabsTrigger value="overview" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="listings" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">My Listings</TabsTrigger>
                    <TabsTrigger value="wishlist" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Wishlist ({bikeIds.size})</TabsTrigger>
                    <TabsTrigger value="notifications" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                    <TabsTrigger value="reviews" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">My Reviews</TabsTrigger>
                    <TabsTrigger value="subscription" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Subscription</TabsTrigger>
                    <TabsTrigger value="settings" className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                                <List className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (stats?.listings_count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Active advertisements</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (stats?.wishlist_count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Saved bikes</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (stats?.reviews_count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Helpful contributions</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (stats?.member_since || "...")}
                                </div>
                                <p className="text-xs text-muted-foreground">Verified Member</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest interactions on MrBikeBD.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Heart className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">Wishlisted Yamaha R15M</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <List className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">Posted ad for Honda CBR</p>
                                        <p className="text-xs text-muted-foreground">Yesterday</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Star className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">Reviewed Suzuki Gixxer</p>
                                        <p className="text-xs text-muted-foreground">3 days ago</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Upgrade to Premium
                                </CardTitle>
                                <CardDescription>Get more visibility and sell faster.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Featured Badge on Listings</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Priority Support</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Extended Ad Duration (30 days)</li>
                                </ul>
                                <Button className="w-full" variant="default">View Plans</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* MY LISTINGS TAB */}
                <TabsContent value="listings" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Manage your ads</h3>
                            <p className="text-sm text-muted-foreground">You have 1 active and 1 expired listing</p>
                        </div>
                        <Button size="sm" asChild><Link href="/sell-bike">Post New Ad</Link></Button>
                    </div>

                    <div className="grid gap-4">
                        {/* Mock Active Listing */}
                        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                            <div className="h-32 w-full sm:w-48 bg-muted rounded-md overflow-hidden relative">
                                <Image src="/bikes/yamaha-r15.webp" alt="Yamaha R15" fill className="object-cover" />
                                <Badge className="absolute top-2 left-2 bg-green-500">Active</Badge>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">Yamaha R15 V4 Racing Blue</h4>
                                        <p className="text-sm text-muted-foreground">Posted on Jan 28, 2026 • Expires in 12 days</p>
                                    </div>
                                    <p className="font-bold text-lg">৳ 4,80,000</p>
                                </div>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>2,500 km</span>
                                    <span>•</span>
                                    <span>Dhaka</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline">Edit</Button>
                                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">Mark Sold</Button>
                                </div>
                            </div>
                        </div>

                        {/* Mock Expired Listing */}
                        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-muted/30 opacity-75">
                            <div className="h-32 w-full sm:w-48 bg-muted rounded-md overflow-hidden relative grayscale">
                                <Image src="/bikes/honda-cb150r.webp" alt="Honda CB150R" fill className="object-cover" />
                                <Badge variant="secondary" className="absolute top-2 left-2">Expired</Badge>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">Honda CB150R Exmotion</h4>
                                        <p className="text-sm text-muted-foreground">Posted on Dec 10, 2025 • Expired</p>
                                    </div>
                                    <p className="font-bold text-lg">৳ 3,90,000</p>
                                </div>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>12,000 km</span>
                                    <span>•</span>
                                    <span>Chattogram</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm">Renew Ad</Button>
                                    <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* WISHLIST TAB */}
                <TabsContent value="wishlist" className="space-y-6">
                    <h3 className="text-lg font-medium">Your Wishlist ({bikeIds.size})</h3>
                    {bikeIds.size === 0 ? (
                        <div className="text-center py-16 bg-muted/20 rounded-lg border-dashed border-2 flex flex-col items-center">
                            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="font-semibold text-lg">Your wishlist is empty</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">Save bikes you are interested in to compare them later or get notified about price drops.</p>
                            <Button asChild><Link href="/bikes">Browse Bikes</Link></Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Placeholder for Wishlist items - in real app would fetch by IDs */}
                            {[...Array(bikeIds.size > 0 ? Math.min(bikeIds.size, 3) : 0)].map((_, i) => (
                                <Card key={i} className="overflow-hidden group">
                                    <div className="aspect-video bg-muted relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <Bike className="h-8 w-8 opacity-20" />
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold">Saved Bike Item {i + 1}</h4>
                                        <p className="text-sm text-muted-foreground mb-4">Bike details would load here...</p>
                                        <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* NOTIFICATIONS TAB */}
                <TabsContent value="notifications" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Recent Notifications</h3>
                        <Button variant="ghost" size="sm" className="text-xs text-primary">Mark all as read</Button>
                    </div>
                    <div className="space-y-4">
                        <Card className="border-l-4 border-l-primary">
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">Listing Approved!</p>
                                        <span className="text-xs text-muted-foreground">2h ago</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Your advertisement for &quot;Yamaha R15 V3&quot; has been approved by our moderation team and is now live on the marketplace.</p>
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="h-8">View Ad</Button>
                                        <Button size="sm" variant="ghost" className="h-8">Dismiss</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex gap-4 items-start text-muted-foreground opacity-70">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Star className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-foreground">New Review on your listing</p>
                                        <span className="text-xs">1d ago</span>
                                    </div>
                                    <p className="text-sm">Someone left a 5-star review on your &quot;Honda CB150R&quot; listing.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* REVIEWS TAB */}
                <TabsContent value="reviews" className="space-y-6">
                    <h3 className="text-lg font-medium">My Reviews</h3>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">Yamaha R15 V4</CardTitle>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, s) => (
                                                    <Star key={s} className={`h-3 w-3 ${s < 4 ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} />
                                                ))}
                                                <span className="text-xs text-muted-foreground ml-2">4.0/5.0</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">2 days ago</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">Great bike with amazing mileage, but the pillion seat is a bit uncomfortable for long rides.</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* SUBSCRIPTION TAB */}
                <TabsContent value="subscription" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You are currently on the Free plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">Free Tier</p>
                                    <p className="text-sm text-muted-foreground">Basic selling features</p>
                                </div>
                                <Badge>Active</Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Plan Features</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 1 Active Listing</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 15 Days Listing Duration</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Basic Analytics</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full sm:w-auto">Upgrade to Premium</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Manage your public profile and contact info.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed as it is linked to your account.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+880 1XXX XXXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">City / District</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Dhaka, Chittagong"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
