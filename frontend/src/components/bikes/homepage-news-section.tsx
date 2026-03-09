"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, ChevronRight, Newspaper } from "lucide-react";
import { useNews } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsArticle } from "@/types";
import { getSafeImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function HomepageNewsSection() {
  const { data: newsData, isLoading } = useNews({
    limit: 3,
  });

  const news = newsData?.articles || [];

  if (isLoading) {
    return <NewsSectionSkeleton />;
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              <Newspaper className="w-3 h-3 mr-1" />
              Latest News
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Stay Updated with <span className="text-primary">MrBike News</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Latest launches, detailed reviews, and industry insights from the motorcycle world in Bangladesh.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex group">
            <Link href="/news">
              Explore All News
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.slice(0, 3).map((article: NewsArticle) => (
            <Card
              key={article.id}
              className="group overflow-hidden border-none shadow-none bg-transparent hover:bg-card transition-all duration-300 rounded-2xl"
            >
              <div className="aspect-video relative rounded-2xl overflow-hidden mb-5 bg-muted">
                <Link
                  href={`/news/${article.slug}`}
                  className="w-full h-full relative block"
                >
                  <Image
                    src={getSafeImageUrl(article.featured_image)}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <Badge className="absolute top-4 left-4 capitalize bg-background/90 text-foreground backdrop-blur-sm z-10 border-none shadow-sm">
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(article.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.views.toLocaleString()} views
                  </span>
                </div>
                <Link href={`/news/${article.slug}`}>
                  <h4 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 px-1">
                    {article.title}
                  </h4>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-2 px-1">
                  {article.excerpt}
                </p>
                <div className="pt-2">
                  <Button asChild variant="link" className="h-auto p-0 text-primary font-semibold hover:no-underline px-1">
                    <Link href={`/news/${article.slug}`}>
                      Read More <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 md:hidden text-center">
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/news">View All News</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function NewsSectionSkeleton() {
  return (
    <section className="py-16 md:py-24">
      <div className="w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-64 md:w-96" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-32 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
