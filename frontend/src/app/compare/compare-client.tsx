"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store";
import { ComparisonTable } from "@/components/bikes/comparison-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bike } from "@/types";

export function CompareClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { bikes: storeBikes, removeBike, addBike } = useCompareStore();

    // Local state for bikes to display (either from store or URL)
    const [displayBikes, setDisplayBikes] = useState<Bike[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If we have bikes in the store, use them
        // In a real app with backend, we might fetch by IDs from URL
        // For now, we rely on the client-side store persistence

        // TODO: If URL has IDs but store is empty, we should fetch them
        // This would require a bulk fetch API endpoint

        setDisplayBikes(storeBikes);
        setIsLoading(false);
    }, [storeBikes]);

    const handleRemove = (bikeId: string) => {
        removeBike(bikeId);
    };

    if (isLoading) {
        return <CompareSkeleton />;
    }

    if (displayBikes.length === 0) {
        return (
            <div className="container py-20 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-muted h-24 w-24 rounded-full mx-auto flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">No Bikes Selected</h1>
                    <p className="text-muted-foreground">
                        Select bikes from the catalogue to compare their specifications side-by-side.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/bikes">Browse Bikes</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (displayBikes.length === 1) {
        return (
            <div className="container py-20 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-muted h-24 w-24 rounded-full mx-auto flex items-center justify-center">
                        <img
                            src={displayBikes[0].thumbnailUrl}
                            alt={displayBikes[0].name}
                            className="w-full h-full object-cover rounded-full opacity-80"
                        />
                    </div>
                    <h1 className="text-2xl font-bold">Add Another Bike</h1>
                    <p className="text-muted-foreground">
                        You have selected <strong>{displayBikes[0].name}</strong>. Add at least one more bike to compare.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => removeBike(displayBikes[0].id)}>
                            Clear Selection
                        </Button>
                        <Button asChild>
                            <Link href="/bikes">Find Competitor</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/bikes">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compare Bikes</h1>
                    <p className="text-muted-foreground">
                        Comparing {displayBikes.length} bikes side-by-side
                    </p>
                </div>
            </div>

            <ComparisonTable bikes={displayBikes} onRemove={handleRemove} />
        </div>
    );
}

function CompareSkeleton() {
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
