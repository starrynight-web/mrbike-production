import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { BrandDetailClient } from "./brand-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const title = slug.split(/[-_ ]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');

    return {
        title: `${title} Bikes in Bangladesh${SEO_DEFAULTS.titleSuffix}`,
        description: `Check out the latest ${title} motorcycle prices, specs, and reviews in Bangladesh.`,
        openGraph: {
            title: `${title} Bikes in Bangladesh - Price & Specs`,
            description: `Check out the latest ${title} motorcycle prices, specs, and reviews in Bangladesh.`,
        },
    };
}

export default async function BrandDetailPage({ params }: Props) {
    const { slug } = await params;

    return (
        <main className="min-h-screen bg-background">
            <Suspense fallback={<BrandDetailSkeleton />}>
                <BrandDetailClient slug={slug} />
            </Suspense>
        </main>
    );
}

function BrandDetailSkeleton() {
    return (
        <div className="container py-12 md:py-20">
            <div className="flex flex-col items-center justify-center space-y-4 mb-12">
                <Skeleton className="h-24 w-40 rounded-lg" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video rounded-xl" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}
