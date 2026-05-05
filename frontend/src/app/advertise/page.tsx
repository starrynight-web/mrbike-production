"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  Check,
  Megaphone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-service";

type PublicConfig = Record<string, string>;
type AdvertiseStat = { value: string; label: string };
type AdvertisePlan = {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
};

function parseList<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function AdvertisePage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig((res.data as PublicConfig | undefined) ?? null);
      } catch (e) {
        console.error("Failed to load advertise config:", e);
      }
    }
    loadConfig();
  }, []);

  // Parse dynamic data
  const stats = parseList<AdvertiseStat>(config?.cms_advertise_stats || "[]");
  const pricingPlans = parseList<AdvertisePlan>(config?.cms_advertise_plans || "[]");
  
  const heroTitle = config?.cms_advertise_hero_title || "Advertise With Us";
  const heroDesc = config?.cms_advertise_hero_desc || "Reach millions of motorcycle enthusiasts in Bangladesh. The perfect platform to showcase your brand, products, and services.";
  
  const pricingTitle = config?.cms_advertise_pricing_title || "Simple, Transparent Pricing";
  const pricingDesc = config?.cms_advertise_pricing_desc || "Choose the plan that best fits your marketing goals. No hidden fees.";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <TrendingUp size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Grow Your Brand
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {heroTitle.split(" ").map((word: string, i: number) => (
                <span key={i} className={i === heroTitle.split(" ").length - 1 ? "text-primary block md:inline" : ""}>
                   {word}{" "}
                </span>
              ))}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {heroDesc}
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                className="h-12 px-8"
                asChild
              >
                <Link href="#pricing">
                  Explore Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="w-full px-4 md:px-8 py-16 border-b">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3 text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {index % 4 === 0 ? <Users className="h-6 w-6" /> : index % 4 === 1 ? <Megaphone className="h-6 w-6" /> : index % 4 === 2 ? <Target className="h-6 w-6" /> : <BarChart className="h-6 w-6" />}
                </div>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(config?.cms_advertise_content && config.cms_advertise_content !== "<p></p>") && (
        <div className="w-full px-4 md:px-8 py-16 max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: config.cms_advertise_content }} />
            </CardContent>
          </Card>
        </div>
      )}

      <div id="pricing" className="bg-muted/30 py-20">
        <div className="w-full px-4 md:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{pricingTitle}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {pricingDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-primary shadow-xl scale-[1.02]"
                    : "hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[44px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/advertise/inquire?plan=${encodeURIComponent(plan.name)}`}>
                      Launch Campaign
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
