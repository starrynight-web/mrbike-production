import { Bike, ShieldCheck, Zap, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `About Us${SEO_DEFAULTS.titleSuffix}`,
    description: "Learn more about MrBikeBD, Bangladesh's most trusted motorcycle ecosystem. Our mission is to simplify bike buying and selling.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-muted/30 border-b overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
                    <Bike size={400} />
                </div>
                <div className="container py-20 relative z-10">
                    <div className="max-w-2xl space-y-4">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">Our Mission</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            The #1 Motorcycle Ecosystem in <span className="text-primary">Bangladesh</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            MrBikeBD is dedicated to revolutionizing the way motorcycles are bought, sold, and researched in Bangladesh. We combine technology with trust to build a safer marketplace.
                        </p>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="container py-20">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Trust & Verification</h3>
                        <p className="text-muted-foreground">
                            Every used bike listing goes through a moderation process to ensure documentation accuracy and seller legitimacy.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Instant Comparision</h3>
                        <p className="text-muted-foreground">
                            Browse through 300+ official models and compare specs, prices, and reviews instantly with our advanced compare tool.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Rider First</h3>
                        <p className="text-muted-foreground">
                            We design our platform with the rider in mind, focusing on usability, accessibility, and honest information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div className="bg-muted/50 py-20">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Founded in 2026, MrBikeBD started as a simple passion project by a group of motorcycle enthusiasts who were frustrated by the lack of reliable data and the complexities of the second-hand market.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Today, we serve thousands of users every month, providing the most accurate bike specifications, latest prices, and a secure environment for buyers and sellers to connect.
                            </p>
                            <div className="flex items-center gap-6 pt-4 text-center">
                                <div>
                                    <p className="text-3xl font-bold">10k+</p>
                                    <p className="text-sm text-muted-foreground">Active Users</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">300+</p>
                                    <p className="text-sm text-muted-foreground">Bike Models</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">1k+</p>
                                    <p className="text-sm text-muted-foreground">Ads Monthly</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Bike className="h-32 w-32 text-primary opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container py-20 text-center space-y-8">
                <div className="max-w-xl mx-auto space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Need help?</h2>
                    <p className="text-muted-foreground">
                        Our support team is here to assist you with your queries about listings, account security, or general feedback.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="h-12 px-8">
                        <MessageSquare className="mr-2 h-5 w-5" /> Contact Support
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8">
                        View FAQs
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { Badge } from "@/components/ui/badge";
