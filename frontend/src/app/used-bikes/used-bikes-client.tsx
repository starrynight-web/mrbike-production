"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
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
  
  const rawBikes = data?.results || [];
  const usedBikes: UsedBike[] = rawBikes.map((item: any) => ({
      id: item.id.toString(),
      bikeName: item.bike_model_name || item.title || "Unknown Bike",
      brandName: item.brand || "Unknown Brand",
      sellerId: item.seller?.toString() || "", 
      sellerName: item.seller_name || "Unknown Seller",
      sellerPhone: item.seller_phone || "",
      images: item.images?.map((img: any) => img.url) || [],
      thumbnailUrl: item.image_url || "/bikes/default.webp",
      price: Number(item.price) || 0,
      year: item.manufacturing_year || new Date().getFullYear(),
      kmDriven: item.mileage || 0,
      condition: item.condition || "good",
      accidentHistory: false,
      location: {
        city: item.location || "Unknown",
        area: "",
      },
      status: item.status || "active",
      isFeatured: item.is_featured || false,
      isVerified: item.is_verified || false,
      expiresAt: new Date(), 
      createdAt: item.created_at || new Date(),
      updatedAt: item.updated_at || new Date(),
  }));

  const meta = {
    total: data?.count || 0,
    totalPages: Math.ceil((data?.count || 0) / 12),
    currentPage: filters.page,
    hasPrevPage: !!data?.previous,
    hasNextPage: !!data?.next,
  };

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
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Used Bikes Marketplace
      </h1>
      <p className="text-muted-foreground mb-8">
        Buy and sell verified used motorcycles in Bangladesh. Find the best
        deals near you.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <UsedBikeFilters />
          </Suspense>
        </aside>

        {/* Listing Grid */}
        <Suspense fallback={<UsedBikesListSkeleton />}>
          <UsedBikesContent />
        </Suspense>
      </div>
    </div>
  );
}
