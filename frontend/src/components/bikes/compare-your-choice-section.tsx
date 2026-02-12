"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, LayoutGrid, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-service";
import { mapBike } from "@/lib/data-utils";
import { useCompareStore } from "@/store";
import type { Bike } from "@/types";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 3;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function CompareYourChoiceSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery.trim(), 300);

  const { bikes, addBike, removeBike, maxBikes } = useCompareStore();
  const canAdd = bikes.length < maxBikes;

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["bikes", "search", debouncedSearch],
    queryFn: async () => {
      const res = await api.getBikes({
        search: debouncedSearch,
        limit: 10,
      });
      if (!res.success) return [];
      const raw = (res.data as any[]) || [];
      return raw.map(mapBike);
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 60 * 1000,
  });

  const results = searchResults || [];

  const handleAddBike = useCallback(
    (bike: Bike) => {
      const normalized = { ...bike, id: String(bike.id) };
      if (addBike(normalized)) {
        setSearchQuery("");
        setIsSearchOpen(false);
      }
    },
    [addBike],
  );

  const handleRemoveBike = useCallback(
    (bikeId: string) => removeBike(String(bikeId)),
    [removeBike],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container">
        <div className="text-left mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Compare your choice
          </h2>
          <p className="text-muted-foreground">
            Add up to {maxBikes} bikes and compare them side by side
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div ref={searchRef} className="relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bikes to compare..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="pl-11 pr-4 h-12 rounded-xl"
              />
            </div>

            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No bikes found. Try another search.
                  </div>
                ) : (
                  <ul className="py-2">
                    {results.map((bike) => {
                      const id = String(bike.id);
                      const alreadyAdded = bikes.some(
                        (b) => String(b.id) === id,
                      );
                      const disabled = alreadyAdded || !canAdd;

                      return (
                        <li key={bike.id}>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && handleAddBike(bike)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors",
                              disabled && "opacity-60 cursor-not-allowed",
                            )}
                          >
                            <div className="relative w-12 h-9 rounded-md overflow-hidden bg-muted shrink-0">
                              <Image
                                src={
                                  bike.thumbnailUrl || "/placeholder-bike.webp"
                                }
                                alt={bike.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                {bike.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {bike.brand?.name || bike.brand_name}
                              </p>
                            </div>
                            {alreadyAdded && (
                              <span className="text-xs text-primary font-medium">
                                Added
                              </span>
                            )}
                            {!canAdd && !alreadyAdded && (
                              <span className="text-xs text-muted-foreground">
                                Max {maxBikes} bikes
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Slots: up to 3 bikes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: maxBikes }).map((_, i) => {
              const bike = bikes[i];
              if (bike) {
                const id = String(bike.id);
                return (
                  <div
                    key={id}
                    className="relative rounded-xl border bg-card overflow-hidden group"
                  >
                    <Link
                      href={`/bike/${bike.slug}`}
                      className="block aspect-[4/3] relative bg-muted"
                    >
                      <Image
                        src={bike.thumbnailUrl || "/placeholder-bike.webp"}
                        alt={bike.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">
                        {bike.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bike.brand?.name || bike.brand_name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBike(id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      aria-label="Remove from compare"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={`empty-${i}`}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 min-h-[180px] text-muted-foreground"
                >
                  <LayoutGrid className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Add bike</span>
                  <span className="text-xs">Slot {i + 1}</span>
                </div>
              );
            })}
          </div>

          {bikes.length >= 2 && (
            <div className="text-center">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2"
                >
                  <LayoutGrid className="h-5 w-5" />
                  Compare {bikes.length} bikes
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
