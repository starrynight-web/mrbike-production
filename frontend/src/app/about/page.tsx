import Link from "next/link";
import { Bike, ShieldCheck, Zap, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";
import { api } from "@/lib/api-service";
import { sanitizeHtml } from "@/lib/sanitize";

type AboutStat = { value: string; label: string };
type AboutValue = { title: string; text: string };

export const metadata: Metadata = {
  title: `About Us${SEO_DEFAULTS.titleSuffix}`,
  description:
    "Learn more about MrBikeBD, Bangladesh's most trusted motorcycle ecosystem. Our mission is to simplify bike buying and selling.",
};

export default async function AboutPage() {
  const configRes = await api.getPublicConfig();
  const config = configRes.success ? configRes.data : {};

  const title = config?.cms_about_title || "The #1 Motorcycle Ecosystem in Bangladesh";
  const subtitle = config?.cms_about_subtitle || "Bangladesh's Most Trusted Digital Motorbike Platform";
  const content = config?.cms_about_content || `
    <p>MrBikeBD is dedicated to revolutionizing the way motorcycles are bought, sold, and researched in Bangladesh. We combine technology with trust to build a safer marketplace.</p>
    <p>Founded in 2024, MrBikeBD started as a simple passion project by a group of motorcycle enthusiasts who were frustrated by the lack of reliable data and the complexities of the second-hand market.</p>
    <p>Today, we serve thousands of users every month, providing the most accurate bike specifications, latest prices, and a secure environment for buyers and sellers to connect.</p>
  `;

  const parseList = <T,>(value: string): T[] => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const stats = parseList<AboutStat>(config?.cms_about_stats || "[]");
  const values = parseList<AboutValue>(config?.cms_about_values || "[]");
  
  const ctaTitle = config?.cms_about_cta_title || "Need help?";
  const ctaDesc = config?.cms_about_cta_desc || "Our support team is here to assist you with your queries about listings, account security, or general feedback.";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Bike size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-20 md:py-24 relative z-10">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              About Our Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="w-full px-4 md:px-8 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border bg-card p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-8 py-20 max-w-4xl mx-auto">
         <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
          />
      </div>

      {values.length > 0 && (
        <div className="w-full px-4 md:px-8 py-20 bg-muted/30 border-y">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Our Core Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The principles that guide every decision we make at MrBikeBD.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((val, idx) => (
                <div key={idx} className="space-y-4 rounded-xl border bg-background p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {idx % 3 === 0 ? <ShieldCheck className="h-6 w-6" /> : idx % 3 === 1 ? <Zap className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
                  </div>
                  <h3 className="text-xl font-semibold">{val.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{val.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{ctaTitle}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{ctaDesc}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/support">
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/faqs">View FAQs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
