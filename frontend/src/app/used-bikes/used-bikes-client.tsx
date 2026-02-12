"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, History } from "lucide-react";
import { useUsedBikes } from "@/hooks/use-used-bikes";
import { UsedBikeCard } from "@/components/used-bikes/used-bike-card";
import { UsedBikeFilters } from "@/components/used-bikes/used-bike-filters";
import { UsedBike } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function UsedBikesContent() {
  const searchParams = useSearchParams();

  // Parse filters from URL
  const filters = {
    brand: searchParams.getAll("brand"),
    condition: searchParams.getAll("condition"),
    priceMin: Number(searchParams.get("minPrice")) || undefined,
    priceMax: Number(searchParams.get("maxPrice")) || undefined,
    location: searchParams.get("location") || undefined,
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading, error } = useUsedBikes(filters);

  const usedBikes = data?.usedBikes || [];

  const meta = data?.meta;

  if (isLoading) {
    return <UsedBikesListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Failed to load bikes
        </h3>
        <p className="text-muted-foreground">
          Something went wrong while fetching the listings. Please try again.
        </p>
      </div>
    );
  }

  if (usedBikes.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
        <div className="bg-muted h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Bikes Found</h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          We couldn&apos;t find any used bikes matching your filters. Try
          adjusting your search criteria.
        </p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/used-bikes")}
        >
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {usedBikes.map((bike: UsedBike) => (
          <UsedBikeCard key={bike.id} bike={bike} />
        ))}
      </div>

      {/* Pagination (Simple for MVP) */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!meta.hasPrevPage}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(meta.currentPage - 1));
              window.history.pushState(null, "", `?${params.toString()}`);
            }}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Page {meta.currentPage} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!meta.hasNextPage}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(meta.currentPage + 1));
              window.history.pushState(null, "", `?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function UsedBikesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="p-2 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UsedBikesClient() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <History size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Used Bikes <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-muted-foreground">
            Buy and sell verified used motorcycles in Bangladesh. Find the best
            deals near you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <Suspense
            fallback={<Skeleton className="w-full lg:w-64 h-[500px]" />}
          >
            <UsedBikeFilters />
          </Suspense>

          {/* Listing Grid */}
          <Suspense fallback={<UsedBikesListSkeleton />}>
            <UsedBikesContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
