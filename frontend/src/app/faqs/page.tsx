"use client";

import { useState, useEffect } from "react";
import { HelpCircle, ChevronDown, MessageSquare, ArrowRight, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/lib/api-service";

export default function FAQPage() {
  const [faqGroups, setFaqGroups] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPublicConfig();
        if (res.success && res.data) {
          setConfig(res.data);
          if (res.data.cms_faqs) {
            setFaqGroups(JSON.parse(res.data.cms_faqs));
          }
        }
      } catch (e) {
        console.error("Failed to load FAQs:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const ctaTitle = config?.cms_faqs_cta_title || "Still have questions?";
  const ctaDesc = config?.cms_faqs_cta_desc || "If you couldn't find what you were looking for, our support team is happy to help you.";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <HelpCircle size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Knowledge Base
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase">
              Frequently <span className="text-primary">Asked Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Find quick answers to common questions about buying, selling, and managing your account.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-20">
        <div className="max-w-4xl mx-auto space-y-20">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {faqGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase border-l-8 border-primary pl-6 tracking-tight">
                    {group.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {group.items.map((item: any, i: number) => (
                      <AccordionItem 
                        key={i} 
                        value={`faq-${groupIndex}-${i}`} 
                        className="border-2 rounded-3xl bg-card px-6 py-1 hover:border-primary/50 transition-colors shadow-sm"
                      >
                        <AccordionTrigger className="hover:no-underline font-bold text-lg md:text-xl text-left py-4">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed text-base md:text-lg font-medium pb-6 pt-2">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
              
              {faqGroups.length === 0 && (
                <div className="text-center space-y-4 py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-xl font-bold">No FAQs found yet.</p>
                </div>
              )}
            </div>
          )}

          <div className="p-8 md:p-16 rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 opacity-10 -mr-16 -mt-16 pointer-events-none">
              <LifeBuoy size={300} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-black italic uppercase">{ctaTitle}</h3>
                <p className="text-primary-foreground/90 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
                  {ctaDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <Button asChild variant="secondary" size="lg" className="h-14 px-10 rounded-2xl text-lg font-black italic uppercase shadow-xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/support">
                    Contact Support <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold bg-white/10 hover:bg-white/20 text-white border-2 border-white/20">
                  <Link href="/contact">
                    General Inquiry
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
