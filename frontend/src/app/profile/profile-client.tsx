"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  List,
  LogOut,
  Bike,
  Calendar,
  Mail,
  Star,
  CreditCard,
  CheckCircle2,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useWishlistStore } from "@/store";
import {
  useUserStats,
  useMyListings,
  useMyReviews,
  useNotifications,
} from "@/hooks/use-user";
import { toast } from "sonner";
import Image from "next/image";

// Import Profile Components
import { AccountManagement } from "@/components/profile/account-management";
import { WishlistTab } from "@/components/profile/wishlist-tab";
import { FavoritesTab } from "@/components/profile/favorites-tab";

interface Notification {
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  [key: string]: unknown;
}

export function ProfileClient() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { bikeIds, favoriteIds } = useWishlistStore();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: myListings, isLoading: listingsLoading } = useMyListings();
  const { data: myReviews, isLoading: reviewsLoading } = useMyReviews();
  const { data: notificationsData, isLoading: notificationsLoading } =
    useNotifications();

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : (notificationsData as unknown as { results: Notification[] })?.results ||
      [];

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user && !statsLoading) {
      router.push("/login");
    }
  }, [user, statsLoading, router]);

  // Redirect if not logged in
  if (!user) {
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

  return (
    <div className="container py-10 space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="text-xl">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center text-muted-foreground gap-1 sm:gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              {user.location && <span className="hidden sm:inline">•</span>}
              {user.location && <span>{user.location}</span>}
              {user.phoneVerified && (
                <Badge
                  variant="secondary"
                  className="ml-0 sm:ml-2 w-fit bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            onClick={handleLogout}
          >
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
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg no-scrollbar">
          <TabsTrigger
            value="overview"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="listings"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            My Listings
          </TabsTrigger>
          <TabsTrigger
            value="wishlist"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Wishlist ({bikeIds.size})
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Favorites ({favoriteIds.size})
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            My Reviews
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Subscription
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Listings
                </CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stats?.listings_count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active advertisements
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stats?.wishlist_count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Saved bikes</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reviews Given
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stats?.reviews_count || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Helpful contributions
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Member Since
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stats?.member_since || "..."
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Verified Member</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions on MrBikeBD.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity to show.
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription>
                  Get more visibility and sell faster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Featured
                    Badge on Listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Priority
                    Support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Extended
                    Ad Duration (30 days)
                  </li>
                </ul>
                <Button className="w-full" variant="default">
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MY LISTINGS TAB */}
        <TabsContent value="listings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Manage your ads</h3>
              <p className="text-sm text-muted-foreground">
                You have {myListings?.length || 0} listings
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/sell-bike">Post New Ad</Link>
            </Button>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myListings?.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling your bike today!
              </p>
              <Button asChild>
                <Link href="/sell-bike">Post Ad</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myListings?.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="h-32 w-full sm:w-48 bg-muted rounded-md overflow-hidden relative">
                    {listing.image_url ? (
                      <Image
                        src={listing.image_url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <Bike className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 left-2 ${
                        listing.status === "active"
                          ? "bg-green-500"
                          : listing.status === "sold"
                            ? "bg-blue-500"
                            : listing.status === "expired"
                              ? "bg-orange-500"
                              : "bg-gray-500"
                      }`}
                    >
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {listing.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Posted on{" "}
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        ৳ {(Number(listing.price) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{(listing.mileage || 0).toLocaleString()} km</span>
                      <span>•</span>
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* WISHLIST TAB (Updated) */}
        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>

        {/* FAVORITES TAB (New) */}
        <TabsContent value="favorites">
          <FavoritesTab />
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Notifications</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              Mark all as read
            </Button>
          </div>

          {notificationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">You are all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification, i: number) => (
                <Card key={i} className="border-l-4 border-l-primary">
                  <CardContent className="p-4 flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">
                        {notification.title || "Notification"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message || JSON.stringify(notification)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-6">
          <h3 className="text-lg font-medium">My Reviews</h3>
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !myReviews || myReviews.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reviews yet</h3>
              <p className="text-muted-foreground">
                You haven&apos;t written any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {review.bike_name || "Unknown Bike"}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {review.rating}.0/5.0
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUBSCRIPTION TAB */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the Free plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Free Tier</p>
                  <p className="text-sm text-muted-foreground">
                    Basic selling features
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Plan Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> 1
                      Active Listing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> 15
                      Days Listing Duration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> Basic
                      Analytics
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto">Upgrade to Premium</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB (Updated) */}
        <TabsContent value="settings">
          <AccountManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
