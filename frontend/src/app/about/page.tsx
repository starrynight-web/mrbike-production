import Link from "next/link";
import { Bike, ShieldCheck, Zap, Heart, MessageSquare, Info, Star, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";
import { api } from "@/lib/api-service";

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

  // Parse JSON fields
  const stats = JSON.parse(config?.cms_about_stats || "[]");
  const values = JSON.parse(config?.cms_about_values || "[]");
  
  const ctaTitle = config?.cms_about_cta_title || "Need help?";
  const ctaDesc = config?.cms_about_cta_desc || "Our support team is here to assist you with your queries about listings, account security, or general feedback.";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-muted/30 border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <Bike size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-4 py-1">
              About Our Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="w-full px-4 md:px-8 -mt-10 relative z-20">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat: any, idx: number) => (
              <div key={idx} className="bg-background border-2 shadow-xl rounded-3xl p-6 md:p-8 text-center space-y-2 hover:translate-y-[-4px] transition-all">
                <div className="text-3xl md:text-5xl font-black text-primary">{stat.value}</div>
                <div className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="w-full px-4 md:px-8 py-24 max-w-4xl mx-auto">
         <div 
            className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-black prose-p:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
      </div>

      {/* Values Section */}
      {values.length > 0 && (
        <div className="w-full px-4 md:px-8 py-24 bg-muted/30 border-y">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black">Our Core Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">The principles that guide every decision we make at MrBikeBD.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((val: any, idx: number) => (
                <div key={idx} className="space-y-4 bg-background p-8 rounded-[2.5rem] border-2 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {idx % 3 === 0 ? <ShieldCheck className="h-8 w-8" /> : idx % 3 === 1 ? <Zap className="h-8 w-8" /> : <Heart className="h-8 w-8" />}
                  </div>
                  <h3 className="text-2xl font-bold">{val.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {val.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="w-full px-4 md:px-8 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-left translate-y-12" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight italic uppercase">{ctaTitle}</h2>
            <p className="text-xl text-muted-foreground font-medium">
              {ctaDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/support">
                <MessageSquare className="mr-2 h-6 w-6" /> Contact Support
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-2" asChild>
              <Link href="/faqs">View FAQs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
