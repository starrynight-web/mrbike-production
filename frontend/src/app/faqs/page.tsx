"use client";

import { useState, useEffect } from "react";
import { HelpCircle, ArrowRight, LifeBuoy } from "lucide-react";
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

type FAQItem = { q: string; a: string };
type FAQGroup = { category: string; items: FAQItem[] };
type PublicConfig = Record<string, string>;

export default function FAQPage() {
  const [faqGroups, setFaqGroups] = useState<FAQGroup[]>([]);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPublicConfig();
        if (res.success && res.data) {
          setConfig(res.data);
          if (res.data.cms_faqs) {
            const parsed = JSON.parse(res.data.cms_faqs);
            setFaqGroups(Array.isArray(parsed) ? (parsed as FAQGroup[]) : []);
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
        <div className="w-full px-4 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              Knowledge Base
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Frequently <span className="text-primary">Asked Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Find quick answers to common questions about buying, selling, and managing your account.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 w-full bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {faqGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-6">
                  <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 tracking-tight">
                    {group.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {group.items.map((item, i) => (
                      <AccordionItem 
                        key={i} 
                        value={`faq-${groupIndex}-${i}`} 
                        className="border rounded-xl bg-card px-4"
                      >
                        <AccordionTrigger className="hover:no-underline font-semibold text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-4 pt-1">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
              
              {faqGroups.length === 0 && (
                <div className="text-center space-y-4 py-16 bg-muted/20 rounded-2xl border border-dashed">
                  <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-semibold">No FAQs found yet.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-20 p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -mr-16 -mt-16 pointer-events-none">
              <LifeBuoy size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold">{ctaTitle}</h3>
                <p className="text-primary-foreground/90 max-w-2xl text-lg leading-relaxed">
                  {ctaDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild variant="secondary" size="lg" className="rounded-full">
                  <Link href="/support">
                    Contact Support <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full bg-white/10 hover:bg-white/20 text-white border-none">
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
