"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, ChevronRight, Hash } from "lucide-react";
import { useNews } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "all", label: "All News" },
    { id: "launch", label: "Launches" },
    { id: "review", label: "Reviews" },
    { id: "industry", label: "Industry" },
    { id: "tips", label: "Tips & Guides" },
];

export function NewsClient() {
    const [activeCategory, setActiveCategory] = useState("all");
    const { data: news = [], isLoading } = useNews(activeCategory === "all" ? undefined : activeCategory);

    const featuredNews = news.length > 0 ? news[0] : null;
    const recentNews = news.length > 0 ? news.slice(1) : [];

    if (isLoading) {
        return <NewsLoadingSkeleton />;
    }

    return (
        <div className="container py-10 md:py-16 space-y-12 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Bike News & Insights</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Unbiased reviews, latest launches, market analysis, and everything else you need to know about the two-wheeler world in Bangladesh.
                    </p>
                </div>

                {/* Category Filter */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
                    <TabsList className="h-auto p-1 bg-muted/50 rounded-full flex-wrap justify-start">
                        {CATEGORIES.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Featured Post (Hero) */}
            {activeCategory === "all" && featuredNews && (
                <section className="relative group overflow-hidden rounded-2xl border bg-card">
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
                            <Image
                                src={featuredNews.featuredImage || "/placeholder-image.png"}
                                alt={featuredNews.title || "Featured news image"}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                                    {featuredNews.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(featuredNews.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>

                            <Link href={`/news/${featuredNews.slug}`} className="group-hover:text-primary transition-colors">
                                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                    {featuredNews.title}
                                </h2>
                            </Link>

                            <p className="text-lg text-muted-foreground line-clamp-3">
                                {featuredNews.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                        <Image
                                            src={featuredNews.author?.image || "/placeholder-avatar.png"}
                                            alt={featuredNews.author?.name || "Author"}
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{featuredNews.author?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">{(featuredNews.views || 0).toLocaleString()} reads</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="rounded-full">
                                    <Link href={`/news/${featuredNews.slug}`}>
                                        Read Article <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Recent News Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">
                        {activeCategory === "all" ? "More Latest Stories" : `Latest in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                    </h3>
                </div>

                {(activeCategory === "all" ? recentNews : news).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(activeCategory === "all" ? recentNews : news).map((article) => (
                            <Card key={article.id} className="group overflow-hidden border-none shadow-none bg-transparent hover:bg-card transition-colors duration-300">
                                <div className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-muted">
                                    <Link href={`/news/${article.slug}`}>
                                        <Image
                                            src={article.featuredImage}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Link>
                                    <Badge className="absolute top-3 left-3 capitalize bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-sm">
                                        {article.category}
                                    </Badge>
                                </div>
                                <CardContent className="p-0 space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {article.views.toLocaleString()}
                                        </span>
                                    </div>
                                    <Link href={`/news/${article.slug}`}>
                                        <h4 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h4>
                                    </Link>
                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-0 mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(article.tags ?? []).map(tag => (
                                            <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                                                <Hash className="h-2.5 w-2.5" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                        <p className="text-muted-foreground">No articles found in this category.</p>
                        <Button variant="link" onClick={() => setActiveCategory("all")}>View all news</Button>
                    </div>
                )}
            </section>

        </div>
    );
}

function NewsLoadingSkeleton() {
    return (
        <div className="container py-16 space-y-12">
            <div className="h-24 bg-muted rounded-xl w-3/4" />
            <div className="h-[500px] bg-muted rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                        <div className="aspect-video bg-muted rounded-xl" />
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
