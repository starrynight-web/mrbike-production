import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEO_DEFAULTS } from "@/config/constants";
import { NewsDetailClient } from "./news-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // In real app, fetch article title here
    const title = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    return {
        title: `${title} - MrBike News${SEO_DEFAULTS.titleSuffix}`,
        description: `Read full article about ${title} on MrBikeBD.`,
        openGraph: {
            title: `${title} - MrBike News`,
            description: `Read full article about ${title} on MrBikeBD.`,
            type: "article",
        },
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;

    return (
        <main className="min-h-screen bg-background">
            <Suspense fallback={<NewsDetailSkeleton />}>
                <NewsDetailClient slug={slug} />
            </Suspense>
        </main>
    );
}

function NewsDetailSkeleton() {
    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="aspect-video w-full rounded-xl mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}
