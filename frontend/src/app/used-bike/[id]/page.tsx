import { Suspense } from "react";
import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { UsedBikeDetailClient } from "./used-bike-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    // In a real app, fetch bike name for title
    return {
        title: `Used Bike Details${SEO_DEFAULTS.titleSuffix}`,
        description: "View details, price, and contact seller for this used bike.",
    };
}

export default async function UsedBikeDetailPage({ params }: Props) {
    const { id } = await params;
    return (
        <main className="min-h-screen">
            <Suspense fallback={<UsedBikeDetailSkeleton />}>
                <UsedBikeDetailClient id={id} />
            </Suspense>
        </main>
    );
}

function UsedBikeDetailSkeleton() {
    return (
        <div className="container py-8">
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                <div className="space-y-8">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
