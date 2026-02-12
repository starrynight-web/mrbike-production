"use client";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bike as BikeIcon, Frown } from "lucide-react";
import { BikeCard, BikeFilters, BikeFiltersSidebar } from "@/components/bikes";
import { Skeleton } from "@/components/ui/skeleton";
import { useBikes, useBrands } from "@/hooks/use-bikes";
import { useFilterStore } from "@/store";
import type { BikeFilters as BikeFiltersType, Bike } from "@/types";

export function BikeCataloguePage() {
  const searchParams = useSearchParams();
  const { selectedBrands, selectedCategories, priceRange, sortBy } =
    useFilterStore();

  // Build filters from URL and store
  const filters: BikeFiltersType = {
    brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
    category:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
    priceMax: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    sortBy: sortBy,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
  };

  // Fetch data
  const {
    data: bikesData,
    isLoading: bikesLoading,
    error: bikesError,
  } = useBikes(filters);
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  const bikes = bikesData?.bikes || [];
  const totalCount = bikesData?.meta?.totalItems || 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <BikeIcon size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              Bike <span className="text-primary">Catalogue</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse and compare 300+ motorcycles available in Bangladesh
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 py-6 md:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          {!brandsLoading && <BikeFiltersSidebar brands={brands} />}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Top Filters Bar */}
            {!brandsLoading && (
              <BikeFilters brands={brands} totalCount={totalCount} />
            )}

            {/* Loading State */}
            {bikesLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border">
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {bikesError && (
              <div className="text-center py-16">
                <Frown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-muted-foreground mb-4">
                  We couldn&apos;t load the bikes. Please try again later.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!bikesLoading && !bikesError && bikes.length === 0 && (
              <div className="text-center py-16">
                <BikeIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No bikes found</h2>
                <p className="text-muted-foreground">
                  Try adjusting your filters to find more bikes.
                </p>
              </div>
            )}

            {/* Bikes Grid */}
            {!bikesLoading && !bikesError && bikes.length > 0 && (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {bikes.map((bike: Bike, index: number) => (
                    <BikeCard
                      key={bike.id}
                      bike={bike}
                      showCompare
                      priority={index < 4}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {!bikesLoading &&
              bikesData?.meta &&
              bikesData.meta.totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <nav className="flex items-center gap-2">
                    {Array.from({
                      length: Math.min(bikesData.meta.totalPages, 5),
                    }).map((_, i) => {
                      const page = i + 1;
                      const isActive = page === bikesData.meta?.currentPage;
                      return (
                        <a
                          key={page}
                          href={`/bikes?page=${page}`}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {page}
                        </a>
                      );
                    })}
                    {bikesData.meta.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <a
                          href={`/bikes?page=${bikesData.meta.totalPages}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-muted"
                        >
                          {bikesData.meta.totalPages}
                        </a>
                      </>
                    )}
                  </nav>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
