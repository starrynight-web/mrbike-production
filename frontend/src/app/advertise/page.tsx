"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  Check,
  Mail,
  Megaphone,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-service";
import { toast } from "sonner";

export default function AdvertisePage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig(res.data);
      } catch (e) {
        console.error("Failed to load advertise config:", e);
      }
    }
    loadConfig();
  }, []);

  // Parse dynamic data
  const stats = JSON.parse(config?.cms_advertise_stats || "[]");
  const pricingPlans = JSON.parse(config?.cms_advertise_plans || "[]");
  
  const heroTitle = config?.cms_advertise_hero_title || "Advertise With Us";
  const heroDesc = config?.cms_advertise_hero_desc || "Reach millions of motorcycle enthusiasts in Bangladesh. The perfect platform to showcase your brand, products, and services.";
  
  const pricingTitle = config?.cms_advertise_pricing_title || "Simple, Transparent Pricing";
  const pricingDesc = config?.cms_advertise_pricing_desc || "Choose the plan that best fits your marketing goals. No hidden fees.";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <TrendingUp size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
              Grow Your Brand
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1] uppercase italic">
              {heroTitle.split(" ").map((word: string, i: number) => (
                <span key={i} className={i === heroTitle.split(" ").length - 1 ? "text-primary block md:inline" : ""}>
                   {word}{" "}
                </span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
              {heroDesc}
            </p>
            <div className="pt-6">
              <Button
                size="lg"
                className="h-16 px-12 rounded-2xl text-xl font-black italic uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                asChild
              >
                <Link href="#pricing">
                  Explore Plans <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="w-full px-4 md:px-8 py-24 bg-muted/20 border-b">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="space-y-4 text-center group">
                <div className="mx-auto h-16 w-16 rounded-[1.25rem] bg-background border-2 shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {index % 4 === 0 ? <Users className="h-8 w-8" /> : index % 4 === 1 ? <Megaphone className="h-8 w-8" /> : index % 4 === 2 ? <Target className="h-8 w-8" /> : <BarChart className="h-8 w-8" />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl md:text-5xl font-black text-primary font-mono">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm md:text-base font-bold uppercase tracking-widest opacity-80">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Content Section */}
      {(config?.cms_advertise_content && config.cms_advertise_content !== "<p></p>") && (
        <div className="w-full px-4 md:px-8 py-24 max-w-4xl mx-auto">
          <Card className="border-4 rounded-[40px] overflow-hidden shadow-2xl border-primary/10">
            <CardContent className="p-10 md:p-16 prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-black prose-p:text-muted-foreground/80">
              <div dangerouslySetInnerHTML={{ __html: config.cms_advertise_content }} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Section */}
      <div id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-muted/40 -skew-y-2 origin-left -translate-y-12" />
        <div className="w-full px-4 md:px-8 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic">{pricingTitle}</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              {pricingDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {pricingPlans.map((plan: any, index: number) => (
              <Card
                key={index}
                className={`flex flex-col rounded-[3rem] border-4 overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? "border-primary shadow-[0_40px_100px_-20px_rgba(239,68,68,0.2)] md:scale-110 z-10 bg-background"
                    : "border-muted-foreground/10 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 bg-background/50 backdrop-blur-sm"
                }`}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-3 font-black uppercase tracking-[0.2em] text-xs">
                    Most Popular Tier
                  </div>
                )}
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tight">{plan.name}</CardTitle>
                  <CardDescription className="text-base font-medium min-h-[48px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-8 p-8 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground font-bold text-lg">
                      {plan.period}
                    </span>
                  </div>
                  <div className="h-1 w-12 bg-primary/20 rounded-full" />
                  <ul className="space-y-4">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-base font-medium">
                        <div className="mt-1 bg-primary/10 rounded-full p-1 shrink-0">
                          <Check className="h-4 w-4 text-primary stroke-[3px]" />
                        </div>
                        <span className="text-muted-foreground leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button
                    className={`w-full h-16 rounded-2xl text-lg font-black uppercase tracking-[0.1em] shadow-xl ${
                      plan.popular ? "shadow-primary/30" : "bg-muted-foreground/10 text-foreground hover:bg-primary hover:text-white"
                    }`}
                    variant={plan.popular ? "default" : "secondary"}
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
