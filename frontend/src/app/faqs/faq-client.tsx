"use client";

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

interface FAQClientProps {
  faqCategories: {
    title: string;
    questions: {
      q: string;
      a: string;
    }[];
  }[];
}

export function FAQClient({ faqCategories }: FAQClientProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <HelpCircle size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
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
          {faqCategories.map((category, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {category.questions.map((item, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`${idx}-${i}`} 
                    className="border rounded-xl bg-card px-4"
                  >
                    <AccordionTrigger className="hover:no-underline font-semibold text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="mt-20 p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10">
              <LifeBuoy size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">Still have questions?</h3>
              <p className="text-primary-foreground/80 max-w-xl text-lg">
                If you couldn&apos;t find what you were looking for, our support team is happy to help you.
              </p>
              <div className="flex flex-wrap gap-4">
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
