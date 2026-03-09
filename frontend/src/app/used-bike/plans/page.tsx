"use client";

import Link from "next/link";
import { Check, ArrowRight, ShieldCheck, Zap, Star, Shield, ArrowLeft } from "lucide-react";
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

export default function UsedBikePlansPage() {
  const plans = [
    {
      name: "Free",
      price: "৳0",
      period: "Forever",
      description: "Basic features for casual sellers.",
      icon: Shield,
      features: [
        "Up to 2 Active Listings",
        "Standard Search Placement",
        "5 Photos per Listing",
        "Basic Support",
      ],
      cta: "Current Plan",
      href: "/profile",
      variant: "outline" as const,
      popular: false,
    },
    {
      name: "Silver",
      price: "৳499",
      period: "/month",
      description: "Enhanced visibility for serious sellers.",
      icon: Zap,
      features: [
        "Up to 5 Active Listings",
        "Priority in Search Results",
        "10 Photos per Listing",
        "Social Media Sharing",
        "Featured Badge (3 days)",
      ],
      cta: "Get Started",
      href: "/used-bike/plans/inquire?plan=silver",
      variant: "default" as const,
      popular: true,
    },
    {
      name: "Gold",
      price: "৳999",
      period: "/month",
      description: "Maximum exposure and expert help.",
      icon: Star,
      features: [
        "Unlimited Active Listings",
        "Top of Search Placement",
        "Unlimited Photos",
        "Featured Badge (15 days)",
        "Priority Support",
        "Market Valuation Report",
      ],
      cta: "Go Gold",
      href: "/used-bike/plans/inquire?plan=gold",
      variant: "default" as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <ShieldCheck size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
              </Link>
            </Button>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
              Premium Seller
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Upgrade Your <span className="text-primary">Selling Power</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Reach more buyers and sell your bike faster with our premium membership plans.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-2xl scale-105 z-10"
                  : "hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                    Recommended
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground font-medium ml-1">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-1">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.variant}
                  size="lg"
                >
                  <Link href={plan.href}>
                    {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
