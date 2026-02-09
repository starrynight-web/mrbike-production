import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { NewsClient } from "./news-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: `Motorcycle News, Reviews & Updates${SEO_DEFAULTS.titleSuffix}`,
    description: "Stay updated with the latest motorcycle launches, reviews, price comparisons, and industry news in Bangladesh.",
    openGraph: {
        title: `Latest Bike News & Reviews${SEO_DEFAULTS.titleSuffix}`,
        description: "Your daily dose of motorcycle news from Bangladesh and around the world.",
        type: "website",
    },
};

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-background">
            <Suspense fallback={<NewsSkeleton />}>
                <NewsClient />
            </Suspense>
        </main>
    );
}

function NewsSkeleton() {
    return (
        <div className="container py-10 md:py-16">
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
