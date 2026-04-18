"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  CreditCard, 
  Zap, 
  Star, 
  Shield,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-service";
import Link from "next/link";
import { format } from "date-fns";

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.patch<any>("/users/profile/", {}); // Workaround to get profile data
        if (res.success) {
          setUser(res.data);
        }
      } catch (e) {
        console.error("Failed to load user info:", e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const membership = user?.membership || "Free";
  const expiryDate = user?.membership_expires ? new Date(user.membership_expires) : null;
  const isExpired = expiryDate ? expiryDate < new Date() : false;

  const planIcons: Record<string, any> = {
    "Free": Shield,
    "Silver": Zap,
    "Gold": Star
  };

  const PlanIcon = planIcons[membership] || Shield;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Subscription</h1>
        <p className="text-muted-foreground">
          Manage your membership, view validity, and upgrade your selling power.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card className="md:col-span-2 border-2 border-primary/20 bg-primary/5 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Current Plan: {membership}</CardTitle>
              <CardDescription>
                Your active membership level on MrBikeBD
              </CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PlanIcon className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-wrap gap-8">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Validity
                </p>
                <p className="text-lg font-bold">
                  {expiryDate ? format(expiryDate, "MMMM d, yyyy") : "Lifetime"}
                </p>
                {isExpired && (
                  <Badge variant="destructive" className="mt-1">Expired</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Status
                </p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-destructive' : 'bg-emerald-500'}`} />
                  <p className="text-lg font-bold">{isExpired ? "Inactive" : "Active"}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/used-bike/plans">
                  {isExpired || membership === "Free" ? "Upgrade Plan" : "Renew Membership"}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <Link href="/dashboard/my-listings">
                  Manage Listings <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats/Info */}
        <div className="space-y-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium">Plan Activated</p>
                    <p className="text-xs text-muted-foreground">Joined MrBikeBD</p>
                  </div>
                  <Badge variant="outline">Free</Badge>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Upgrade to Silver or Gold to see transaction history.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Subscription Help
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Need help with your payment?</p>
              <p>Contact us at <span className="text-primary font-medium">support@mrbikebd.com</span></p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Benefits Comparison (Quick view) */}
      <div className="pt-8">
        <h2 className="text-xl font-bold mb-6">Explore Other Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Free", "Silver", "Gold"].map((plan) => (
            <Card key={plan} className={plan === membership ? "border-primary bg-primary/5" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{plan}</CardTitle>
                  {plan === membership && <Badge>Active</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{plan === "Gold" ? "Unlimited" : plan === "Silver" ? "5" : "2"} Active Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>{plan === "Gold" ? "Top" : plan === "Silver" ? "Priority" : "Standard"} Search</span>
                </div>
              </CardContent>
              <CardFooter>
                {plan === membership ? (
                  <Button variant="ghost" disabled className="w-full">Current Plan</Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/used-bike/plans">View Plan</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
