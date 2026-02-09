"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBrands } from "@/hooks/use-bikes";
import { Brand } from "@/types";
import { BD_CITIES, BIKE_CONDITIONS } from "@/config/constants";
import { cn, formatPrice } from "@/lib/utils";

export function UsedBikeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: brands } = useBrands();

  // -- State from URL --
  const selectedBrands = searchParams.getAll("brand");
  const selectedConditions = searchParams.getAll("condition");
  const location = searchParams.get("location") || "all";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 1000000;

  // -- Handlers --
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      // Reset page on filter change
      newSearchParams.set("page", "1");
      return newSearchParams.toString();
    },
    [searchParams],
  );

  const toggleBrand = (slug: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const brands = newSearchParams.getAll("brand");

    if (brands.includes(slug)) {
      newSearchParams.delete("brand");
      brands
        .filter((b) => b !== slug)
        .forEach((b) => newSearchParams.append("brand", b));
    } else {
      newSearchParams.append("brand", slug);
    }

    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const toggleCondition = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const conditions = newSearchParams.getAll("condition");

    if (conditions.includes(value)) {
      newSearchParams.delete("condition");
      conditions
        .filter((c) => c !== value)
        .forEach((c) => newSearchParams.append("condition", c));
    } else {
      newSearchParams.append("condition", value);
    }

    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const handlePriceChange = (value: number[]) => {
    router.push(
      `?${createQueryString({
        minPrice: value[0],
        maxPrice: value[1],
      })}`,
      { scroll: false },
    );
  };

  const handleLocationChange = (value: string) => {
    router.push(
      `?${createQueryString({
        location: value === "all" ? null : value,
      })}`,
      { scroll: false },
    );
  };

  const clearFilters = () => {
    router.push("/used-bikes");
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedConditions.length +
    (location !== "all" ? 1 : 0) +
    (minPrice > 0 || maxPrice < 1000000 ? 1 : 0);

  const filterContentProps = {
    activeFilterCount,
    clearFilters,
    minPrice,
    maxPrice,
    handlePriceChange,
    location,
    handleLocationChange,
    selectedConditions,
    toggleCondition,
    brands,
    selectedBrands,
    toggleBrand,
  };

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2 hide-scrollbar pb-10">
        <FilterContent {...filterContentProps} />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 justify-center rounded-full text-[10px]"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <SheetHeader className="px-6 py-4 border-b text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Find the perfect used bike</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] px-6 py-6">
              <FilterContent mobile {...filterContentProps} />
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t mt-auto">
              <SheetClose asChild>
                <Button className="w-full">Show Results</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

interface FilterContentProps {
  mobile?: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
  minPrice: number;
  maxPrice: number;
  handlePriceChange: (value: number[]) => void;
  location: string;
  handleLocationChange: (value: string) => void;
  selectedConditions: string[];
  toggleCondition: (value: string) => void;
  brands: Brand[];
  selectedBrands: string[];
  toggleBrand: (slug: string) => void;
}

function FilterContent({
  mobile = false,
  activeFilterCount,
  clearFilters,
  minPrice,
  maxPrice,
  handlePriceChange,
  location,
  handleLocationChange,
  selectedConditions,
  toggleCondition,
  brands,
  selectedBrands,
  toggleBrand,
}: FilterContentProps) {
  return (
    <div className={cn("space-y-6", mobile ? "px-1" : "")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range</Label>
        <Slider
          value={[minPrice, maxPrice]}
          max={1000000}
          step={5000}
          minStepsBetweenThumbs={1}
          onValueCommit={handlePriceChange}
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="border px-2 py-1 rounded bg-muted">
            {formatPrice(minPrice)}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="border px-2 py-1 rounded bg-muted">
            {formatPrice(maxPrice)}
          </span>
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-3">
        <Label>Location</Label>
        <Select value={location} onValueChange={handleLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bangladesh</SelectItem>
            {BD_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Dynamic Sections */}
      <Accordion
        type="multiple"
        defaultValue={["condition", "brand"]}
        className="w-full"
      >
        {/* Condition */}
        <AccordionItem value="condition">
          <AccordionTrigger>Condition</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {BIKE_CONDITIONS.map((condition) => (
                <div
                  key={condition.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`cond-${condition.value}`}
                    checked={selectedConditions.includes(condition.value)}
                    onCheckedChange={() => toggleCondition(condition.value)}
                  />
                  <label
                    htmlFor={`cond-${condition.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {condition.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand */}
        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1 max-h-[300px] overflow-y-auto pr-2">
              {brands?.map((brand: Brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleBrand(brand.slug)}
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {brand.name}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ({brand.bikeCount})
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
