import { Suspense } from "react";
import { Metadata } from "next";
import { CompareClient } from "./compare-client";
import { SEO_DEFAULTS } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: `Compare Bikes${SEO_DEFAULTS.titleSuffix}`,
    description: "Compare motorcycle specifications, features, and prices side-by-side to find the perfect bike for you.",
    openGraph: {
        title: `Compare Bikes${SEO_DEFAULTS.titleSuffix}`,
        description: "Compare motorcycle specifications, features, and prices side-by-side.",
    },
};

export default function ComparePage() {
    return (
        <main className="min-h-screen">
            <Suspense fallback={<ComparePageSkeleton />}>
                <CompareClient />
            </Suspense>
        </main>
    );
}

function ComparePageSkeleton() {
    return (
        <div className="container py-12">
            <div className="flex gap-4 mb-8">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
    );
}
