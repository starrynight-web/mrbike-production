"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, 
  ChevronRight, 
  Calculator, 
  ClipboardCheck, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Fuel,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { api } from "@/lib/api-service";

export default function ServicesPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPublicConfig();
        if (res.success) setConfig(res.data);
      } catch (e) {
        console.error("Failed to load services config:", e);
      }
    }
    loadConfig();
  }, []);

  const services = [
    {
      title: "Bike Registration & License",
      description: "Complete guide to motorcycle registration, driving license process, fees, and necessary documents in Bangladesh.",
      href: "/services/bike-registration",
      icon: <ClipboardCheck className="h-10 w-10" />,
      color: "bg-blue-500",
      badges: ["Official BRTA Fees", "Step-by-Step Guide", "Document Checklists"],
      tags: ["Registration", "License", "Fees"]
    },
    {
      title: "Expense Calculator",
      description: "Estimate your bike-related expenses including monthly EMI, total interest, and octane consumption per trip.",
      href: "/services/expense-calculator",
      icon: <Calculator className="h-10 w-10" />,
      color: "bg-orange-500",
      badges: ["EMI Calculator", "Octane Cost Estimator", "Finance Planning"],
      tags: ["Finance", "Savings", "Fuel"]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <div className="bg-muted/30 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Wrench size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-24 relative z-10">
          <div className="max-w-4xl space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
              Digital Services
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase italic">
              Tools for <span className="text-primary">Every Biker</span>
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
              We provide essential digital tools and comprehensive guides to make your motorcycle ownership journey smooth and cost-effective.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 -mt-12 max-w-7xl mx-auto relative z-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {services.map((service, idx) => (
            <Link key={idx} href={service.href} className="group block">
              <Card className="h-full border-4 border-primary/10 hover:border-primary/40 transition-all duration-500 rounded-[3.5rem] overflow-hidden shadow-2xl hover:shadow-primary/10 group-hover:-translate-y-2">
                <CardHeader className="p-10 md:p-14 space-y-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="p-6 rounded-[2rem] bg-muted/50 border-2 border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      {service.icon}
                    </div>
                    <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ArrowUpRight className="h-6 w-6 text-primary group-hover:scale-125 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                      {service.title}
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-10 md:px-14 pb-14 space-y-8">
                  <div className="flex flex-wrap gap-2">
                    {service.badges.map((badge, bIdx) => (
                      <Badge key={bIdx} variant="secondary" className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t-2 border-dashed">
                     <div className="text-center space-y-1">
                        <ShieldCheck className="h-6 w-6 mx-auto text-primary opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certified</p>
                     </div>
                     <div className="text-center space-y-1">
                        <Zap className="h-6 w-6 mx-auto text-primary opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instant</p>
                     </div>
                     <div className="text-center space-y-1">
                        <Fuel className="h-6 w-6 mx-auto text-primary opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Efficient</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Use Our Services */}
      <div className="w-full px-4 md:px-8 mt-40 max-w-6xl mx-auto">
         <div className="text-center space-y-6 mb-20">
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Why Use <span className="text-primary">MrBikeBD Services?</span></h3>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto italic">Everything you need to manage your bike life in one single dashboard.</p>
         </div>
         
         <div className="grid md:grid-cols-3 gap-12">
            {[
               {
                  title: "Real Data",
                  desc: "All figures and guides are based on official BRTA and market standards.",
                  icon: <CreditCard className="h-10 w-10 text-primary" />
               },
               {
                  title: "Save Time",
                  desc: "Skip the long queues and research. Get all the answers instantly here.",
                  icon: <Zap className="h-10 w-10 text-primary" />
               },
               {
                  title: "Expert Support",
                  desc: "Have questions? Our support team is linked directly to our service portal.",
                  icon: <ShieldCheck className="h-10 w-10 text-primary" />
               }
            ].map((feature, fIdx) => (
               <div key={fIdx} className="space-y-6 group">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-muted/50 border-2 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-6">
                     {feature.icon}
                  </div>
                  <h4 className="text-2xl font-black uppercase italic">{feature.title}</h4>
                  <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
               </div>
            ))}
         </div>
      </div>
      
      {/* Bottom CTA */}
      <div className="w-full px-4 md:px-8 mt-40 max-w-5xl mx-auto">
         <div className="bg-primary p-12 md:p-20 rounded-[4rem] text-center space-y-8 shadow-2xl shadow-primary/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <h2 className="text-4xl md:text-7xl font-black uppercase italic text-primary-foreground leading-tight tracking-tighter">
               Need <span className="underline decoration-white/30 decoration-8 underline-offset-8">Custom</span> Support?
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 font-medium max-w-2xl mx-auto">
               If you can't find what you're looking for, our support team is available 24/7 to help you with complex registration or licensing issues.
            </p>
            <div className="pt-6">
               <Button size="lg" variant="secondary" className="h-20 px-12 rounded-[1.5rem] text-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl" asChild>
                  <Link href="/support">Get Support Now <ArrowUpRight className="ml-3 h-8 w-8" /></Link>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
