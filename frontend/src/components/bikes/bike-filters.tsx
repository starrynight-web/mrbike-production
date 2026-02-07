"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BIKE_CATEGORIES,
  PRICE_RANGES,
  CC_RANGES,
  BIKE_SORT_OPTIONS,
} from "@/config/constants";
import { useFilterStore } from "@/store";
import type { Brand } from "@/types";

interface FilterContentProps {
  brands: Brand[];
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  priceRange: number[];
  selectPriceRange: (range: { min: number; max: number }) => void;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  ccRange: number[];
  setCcRange: (range: [number, number]) => void;
}

function FilterContent({
  brands,
  selectedCategories,
  toggleCategory,
  priceRange,
  selectPriceRange,
  selectedBrands,
  toggleBrand,
  ccRange,
  setCcRange,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          {BIKE_CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              variant={
                selectedCategories.includes(cat.value) ? "default" : "outline"
              }
              className="cursor-pointer transition-colors"
              onClick={() => toggleCategory(cat.value)}
            >
              {cat.icon} {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              priceRange[0] === range.min &&
              (range.max === Infinity
                ? priceRange[1] >= 10000000
                : priceRange[1] === range.max);
            return (
              <button
                key={range.label}
                onClick={() => selectPriceRange(range)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h4 className="font-medium mb-3">Brand</h4>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted px-2 py-1.5 rounded-md"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm flex-1">{brand.name}</span>
                <span className="text-xs text-muted-foreground">
                  {brand.bikeCount}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Engine CC */}
      <div>
        <h4 className="font-medium mb-3">Engine (CC)</h4>
        <div className="space-y-2">
          {CC_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() =>
                setCcRange([
                  range.min,
                  range.max === Infinity ? 1000 : range.max,
                ])
              }
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                ccRange[0] === range.min
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BikeFiltersProps {
  brands: Brand[];
  totalCount: number;
}

export function BikeFilters({ brands, totalCount }: BikeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const {
    selectedBrands,
    selectedCategories,
    priceRange,
    ccRange,
    sortBy,
    setSelectedBrands,
    setSelectedCategories,
    setPriceRange,
    setCcRange,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  // Sync URL params to store on mount
  useEffect(() => {
    const brandsParam = searchParams.get("brand");
    const categoriesParam = searchParams.get("category");
    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const sortParam = searchParams.get("sortBy");
    const ccMinParam = searchParams.get("ccMin");
    const ccMaxParam = searchParams.get("ccMax");

    if (brandsParam) setSelectedBrands(brandsParam.split(","));
    if (categoriesParam) setSelectedCategories(categoriesParam.split(","));
    if (priceMinParam || priceMaxParam) {
      setPriceRange([
        priceMinParam ? parseInt(priceMinParam) : 0,
        priceMaxParam ? parseInt(priceMaxParam) : 10000000,
      ]);
    }
    if (sortParam) setSortBy(sortParam);

    if (ccMinParam || ccMaxParam) {
      setCcRange([
        ccMinParam ? parseInt(ccMinParam) : 0,
        ccMaxParam ? parseInt(ccMaxParam) : 1000,
      ]);
    }
  }, [
    searchParams,
    setPriceRange,
    setSelectedBrands,
    setSelectedCategories,
    setSortBy,
    setCcRange,
  ]);

  // Update URL when filters change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(","));
    }
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (priceRange[0] > 0) {
      params.set("priceMin", priceRange[0].toString());
    }
    if (priceRange[1] < 10000000) {
      params.set("priceMax", priceRange[1].toString());
    }
    if (sortBy !== "popularity") {
      params.set("sortBy", sortBy);
    }

    // Add ccRange to URL params
    if (ccRange[0] > 0) {
      params.set("ccMin", ccRange[0].toString());
    }
    if (ccRange[1] < 1000) {
      params.set("ccMax", ccRange[1].toString());
    }

    const queryString = params.toString();
    router.push(`/bikes${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [selectedBrands, selectedCategories, priceRange, ccRange, sortBy, router]);

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  const selectPriceRange = (range: { min: number; max: number }) => {
    setPriceRange([range.min, range.max === Infinity ? 10000000 : range.max]);
  };

  const handleApply = () => {
    updateUrl();
    setIsOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    router.push("/bikes", { scroll: false });
    setIsOpen(false);
  };

  const activeFiltersCount =
    selectedBrands.length +
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 10000000 ? 1 : 0);

  // Filter Content (shared between mobile sheet and desktop sidebar)

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{totalCount}</span> bikes
        found
      </p>

      <div className="flex items-center gap-2">
        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v);
            updateUrl();
          }}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {BIKE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
              <FilterContent
                brands={brands}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                priceRange={priceRange}
                selectPriceRange={selectPriceRange}
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                ccRange={ccRange}
                setCcRange={setCcRange}
              />
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Tags (shown below on mobile) */}
      {activeFiltersCount > 0 && (
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          {selectedBrands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleBrand(brand)}
              />
            </Badge>
          ))}
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1 capitalize">
              {cat}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCategory(cat)}
              />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Desktop Sidebar version of filters
export function BikeFiltersSidebar({ brands }: { brands: Brand[] }) {
  const {
    selectedBrands,
    selectedCategories,
    priceRange,
    setSelectedBrands,
    setSelectedCategories,
    setPriceRange,
    resetFilters,
  } = useFilterStore();

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium mb-3">Category</h4>
            <div className="space-y-2">
              {BIKE_CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => toggleCategory(cat.value)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">
                    {cat.icon} {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium mb-3">Price Range</h4>
            <div className="space-y-1">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    setPriceRange([
                      range.min,
                      range.max === Infinity ? 10000000 : range.max,
                    ])
                  }
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    priceRange[0] === range.min
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brands */}
          <div>
            <h4 className="text-sm font-medium mb-3">Brand</h4>
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-4">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-1 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.slug)}
                      onChange={() => toggleBrand(brand.slug)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="text-sm flex-1">{brand.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({brand.bikeCount})
                    </span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </aside>
  );
}
